package com.sphinxtravel.CyrusCRM_ext.network

import android.content.Context
import android.util.Log
import com.sphinxtravel.CyrusCRM_ext.data.model.AuthSession
import com.sphinxtravel.CyrusCRM_ext.data.model.User
import com.sphinxtravel.CyrusCRM_ext.data.repository.AuthRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteAuthRepository
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class AuthApiClient(
    context: Context,
    private val onUnauthorizedListener: (() -> Unit)? = null
) {
    private val authRepository: AuthRepository = SqliteAuthRepository(context.applicationContext)

    companion object {
        private const val TAG = "CyrusAuthApiClient"
        private const val BASE_URL = "http://69.169.103.92:9000"
        private const val LOGIN_ENDPOINT = "$BASE_URL/api/mobile/auth/login"
        private const val ME_ENDPOINT = "$BASE_URL/api/mobile/auth/me"
        private const val CONNECT_TIMEOUT_MS = 15_000
        private const val READ_TIMEOUT_MS = 15_000
    }

    /**
     * Executes HTTP POST request to login.
     * On success, saves token and user in SQLite database.
     */
    fun login(usernameOrEmail: String, password: String): Result<AuthSession> {
        var connection: HttpURLConnection? = null
        return try {
            val payload = JSONObject().apply {
                put("usernameOrEmail", usernameOrEmail)
                put("password", password)
            }

            connection = (URL(LOGIN_ENDPOINT).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                doOutput = true
                doInput = true
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                setRequestProperty("User-Agent", "Android/CyrusCRM")
            }

            connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }

            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.bufferedReader()?.use { it.readText() } ?: ""
            Log.d(TAG, "Login HTTP $code response: $responseText")

            if (responseText.isNotBlank() && responseText.trim().startsWith("{")) {
                try {
                    val json = JSONObject(responseText)
                    val success = json.optBoolean("Success", false) || json.optBoolean("success", false)
                    val message = json.optString("Message", json.optString("message", "")).trim()

                    if (code in 200..299 && success) {
                        val data = json.optJSONObject("Data") ?: json.optJSONObject("data")
                        if (data != null) {
                            val token = data.optString("Token", data.optString("token", ""))
                            val expiration = data.optString("Expiration", data.optString("expiration", ""))
                            val userObj = data.optJSONObject("User") ?: data.optJSONObject("user")

                            if (token.isNotBlank() && userObj != null) {
                                val user = parseUser(userObj)
                                val session = AuthSession(token = token, expiration = expiration, user = user)
                                authRepository.saveSession(session)
                                Log.d(TAG, "Login successful, saved user ${user.userName} to SQLite")
                                return Result.success(session)
                            }
                        }
                    }

                    val cleanMessage = when {
                        message.isNotBlank() -> message
                        json.has("Errors") && !json.isNull("Errors") && json.optString("Errors").isNotBlank() -> json.optString("Errors")
                        else -> "Login failed (HTTP $code)"
                    }
                    return Result.failure(Exception(cleanMessage))
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to parse login response JSON", e)
                }
            }
            Result.failure(Exception("HTTP Error $code"))
        } catch (e: java.net.SocketTimeoutException) {
            Log.e(TAG, "Login socket timeout", e)
            Result.failure(Exception("Connection timeout while connecting to server (http://69.169.103.92:9000). Please check your internet connection or server status."))
        } catch (e: java.net.ConnectException) {
            Log.e(TAG, "Login connection refused/failed", e)
            Result.failure(Exception("Could not connect to server (http://69.169.103.92:9000). Please ensure your device has network access."))
        } catch (e: Exception) {
            Log.e(TAG, "Login exception", e)
            Result.failure(e)
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Executes authenticated GET call to /api/mobile/auth/me.
     * Uses base query logic attaching Authorization Bearer header.
     * Handles 401 Unauthorized by clearing SQLite session and invoking redirect.
     */
    fun getMe(): Result<User> {
        val result = executeAuthenticatedRequest(ME_ENDPOINT, "GET", null)
        return result.mapCatching { responseText ->
            val json = JSONObject(responseText)
            val success = json.optBoolean("Success", false) || json.optBoolean("success", false)
            if (success) {
                val data = json.optJSONObject("Data") ?: json.optJSONObject("data")
                    ?: throw Exception("Empty user data")
                val user = parseUser(data)
                authRepository.updateUser(user)
                user
            } else {
                val message = json.optString("Message", "Failed to fetch user profile")
                throw Exception(message)
            }
        }
    }

    /**
     * Base Query Interceptor for authenticated calls.
     * Reads token from SQLite, adds Bearer header.
     * On 401 or missing token, triggers session cleanup & onUnauthorized callback.
     */
    fun executeAuthenticatedRequest(
        urlStr: String,
        method: String,
        bodyJson: JSONObject? = null
    ): Result<String> {
        val token = authRepository.getToken()
        if (token.isNullOrBlank()) {
            handleUnauthorized("No valid token saved in SQLite")
            return Result.failure(Exception("UNAUTHORIZED: No saved token"))
        }

        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(urlStr).openConnection() as HttpURLConnection).apply {
                requestMethod = method
                doInput = true
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                setRequestProperty("Authorization", "Bearer $token")
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                setRequestProperty("User-Agent", "Android/CyrusCRM")
                if (bodyJson != null && (method == "POST" || method == "PUT" || method == "PATCH")) {
                    doOutput = true
                }
            }

            if (bodyJson != null && connection.doOutput) {
                connection.outputStream.use { it.write(bodyJson.toString().toByteArray(Charsets.UTF_8)) }
            }

            val code = connection.responseCode
            Log.d(TAG, "Request $method $urlStr -> HTTP $code")

            if (code == 401) {
                handleUnauthorized("Received HTTP 401 Unauthorized from $urlStr")
                return Result.failure(Exception("UNAUTHORIZED: 401 response"))
            }

            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.bufferedReader()?.use { it.readText() } ?: ""

            if (code in 200..299) {
                Result.success(responseText)
            } else {
                Result.failure(Exception("HTTP Error $code: $responseText"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Authenticated request exception to $urlStr", e)
            Result.failure(e)
        } finally {
            connection?.disconnect()
        }
    }

    private fun handleUnauthorized(reason: String) {
        Log.w(TAG, "Unauthorized condition reached: $reason. Clearing SQLite auth and notifying listener.")
        authRepository.clearSession()
        onUnauthorizedListener?.invoke()
    }

    private fun parseUser(userObj: JSONObject): User {
        val id = userObj.optString("Id", userObj.optString("id", ""))
        val userName = userObj.optString("UserName", userObj.optString("userName", ""))
        val fullName = userObj.optString("FullName", userObj.optString("fullName", ""))
        val email = userObj.optString("Email", userObj.optString("email", ""))
        
        val rolesList = mutableListOf<String>()
        val rolesArray = userObj.optJSONArray("Roles") ?: userObj.optJSONArray("roles")
        if (rolesArray != null) {
            for (i in 0 until rolesArray.length()) {
                rolesList.add(rolesArray.getString(i))
            }
        }

        return User(
            id = id,
            userName = userName,
            fullName = fullName,
            email = email,
            roles = rolesList
        )
    }
}
