package com.sphinxtravel.CyrusCRM_ext.upload

import android.util.Log
import android.webkit.MimeTypeMap
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL

class CallUploadApiClient {

    companion object {
        private const val TAG = "CyrusCallUploadApiClient"
        private const val BASE_URL = "http://69.169.103.92:9000"
        private const val DATA_ENDPOINT = "http://82.29.168.80:3000/api/data"
        private const val DRIVE_TOKEN_ENDPOINT = "$BASE_URL/api/mobile/drive/token"
        private const val GOOGLE_DRIVE_UPLOAD_ENDPOINT = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
        private const val CONNECT_TIMEOUT_MS = 15_000
        private const val READ_TIMEOUT_MS = 15_000
    }

    /**
     * Fetches short-lived Google Drive OAuth access token & rootFolderId from backend endpoint.
     * Tries candidate endpoints to ensure resilience against route path variations.
     */
    fun fetchGoogleDriveToken(appAccessToken: String): GoogleDriveTokenResponse? {
        val candidateUrls = listOf(
            "$BASE_URL/api/mobile/drive/token",
            "$BASE_URL/api/mobile/auth/drive/token",
            "$BASE_URL/api/mobile/drive/token/"
        )

        for (urlStr in candidateUrls) {
            var connection: HttpURLConnection? = null
            try {
                connection = (URL(urlStr).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    doInput = true
                    connectTimeout = CONNECT_TIMEOUT_MS
                    readTimeout = READ_TIMEOUT_MS
                    if (appAccessToken.isNotBlank()) {
                        setRequestProperty("Authorization", "Bearer ${appAccessToken.trim()}")
                    }
                    setRequestProperty("Accept", "application/json")
                    setRequestProperty("User-Agent", "Android/CyrusCRM")
                }

                val code = connection.responseCode
                val stream = if (code in 200..299) connection.inputStream else connection.errorStream
                val responseText = stream?.bufferedReader()?.use { it.readText() } ?: ""
                Log.d(TAG, "Fetch Drive token ($urlStr) HTTP $code, response: $responseText, hasAppToken=${appAccessToken.isNotBlank()}")

                if (code in 200..299 && responseText.isNotBlank()) {
                    val json = JSONObject(responseText)
                    val success = json.optBoolean("Success", false) || json.optBoolean("success", false)
                    if (success) {
                        val data = json.optJSONObject("Data") ?: json.optJSONObject("data")
                        if (data != null) {
                            val accessToken = data.optString("AccessToken", data.optString("accessToken", ""))
                            val tokenType = data.optString("TokenType", data.optString("tokenType", "Bearer"))
                            val expiresInSeconds = data.optLong("ExpiresInSeconds", data.optLong("expiresInSeconds", 3600L))
                            val rootFolderId = data.optString("RootFolderId", data.optString("rootFolderId", ""))
                            val userFolderName = when {
                                data.has("UserFolderName") && !data.isNull("UserFolderName") -> data.optString("UserFolderName")
                                data.has("userFolderName") && !data.isNull("userFolderName") -> data.optString("userFolderName")
                                else -> null
                            }
                            val userFolderId = when {
                                data.has("UserFolderId") && !data.isNull("UserFolderId") -> data.optString("UserFolderId")
                                data.has("userFolderId") && !data.isNull("userFolderId") -> data.optString("userFolderId")
                                else -> null
                            }

                            val effectiveFolderId = when {
                                !userFolderId.isNullOrBlank() -> userFolderId
                                rootFolderId.isNotBlank() -> rootFolderId
                                else -> ""
                            }

                            if (accessToken.isNotBlank() && effectiveFolderId.isNotBlank()) {
                                Log.d(TAG, "Successfully fetched Google Drive token from $urlStr, userFolderId=$userFolderId, rootFolderId=$rootFolderId")
                                return GoogleDriveTokenResponse(
                                    accessToken = accessToken,
                                    tokenType = tokenType,
                                    expiresInSeconds = expiresInSeconds,
                                    rootFolderId = effectiveFolderId,
                                    userFolderName = userFolderName,
                                    userFolderId = userFolderId
                                )
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error fetching Google Drive token from $urlStr", e)
            } finally {
                connection?.disconnect()
            }
        }
        return null
    }

    /**
     * Uploads audio binary directly from Android device to Google Drive API using HTTP multipart/related.
     * POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart
     *
     * Uploads the file directly into the specified rootFolderId parent folder.
     * Returns Google Drive fileId on success, or null on failure.
     */
    fun uploadFileToGoogleDrive(
        filePath: String,
        fileName: String,
        googleAccessToken: String,
        rootFolderId: String
    ): String? {
        val file = File(filePath)
        if (!file.exists() || !file.isFile) {
            Log.e(TAG, "Recording file does not exist at path: $filePath")
            return null
        }

        var connection: HttpURLConnection? = null
        val boundary = "foo_bar_baz_" + System.currentTimeMillis()
        val lineEnd = "\r\n"
        val twoHyphens = "--"

        return try {
            connection = (URL(GOOGLE_DRIVE_UPLOAD_ENDPOINT).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                doOutput = true
                doInput = true
                useCaches = false
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                setRequestProperty("Authorization", "Bearer $googleAccessToken")
                setRequestProperty("Content-Type", "multipart/related; boundary=$boundary")
                setRequestProperty("User-Agent", "Android/CyrusCRM")
            }

            val mimeType = getMimeType(file.extension) ?: "audio/mpeg"

            val metadataJson = JSONObject().apply {
                put("name", fileName)
                if (rootFolderId.isNotBlank()) {
                    val parentsArray = org.json.JSONArray().apply { put(rootFolderId) }
                    put("parents", parentsArray)
                }
            }

            connection.outputStream.use { os ->
                // Part 1: JSON Metadata
                val part1Header = StringBuilder()
                    .append(twoHyphens).append(boundary).append(lineEnd)
                    .append("Content-Type: application/json; charset=UTF-8").append(lineEnd)
                    .append(lineEnd)
                    .append(metadataJson.toString()).append(lineEnd)
                    .toString()
                os.write(part1Header.toByteArray(Charsets.UTF_8))

                // Part 2: Audio Binary Stream
                val part2Header = StringBuilder()
                    .append(twoHyphens).append(boundary).append(lineEnd)
                    .append("Content-Type: ").append(mimeType).append(lineEnd)
                    .append(lineEnd)
                    .toString()
                os.write(part2Header.toByteArray(Charsets.UTF_8))

                FileInputStream(file).use { fis ->
                    val buffer = ByteArray(16384)
                    var bytesRead: Int
                    while (fis.read(buffer).also { bytesRead = it } != -1) {
                        os.write(buffer, 0, bytesRead)
                    }
                }

                val footer = lineEnd + twoHyphens + boundary + twoHyphens + lineEnd
                os.write(footer.toByteArray(Charsets.UTF_8))
                os.flush()
            }

            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.bufferedReader()?.use { it.readText() } ?: ""
            Log.d(TAG, "Google Drive upload (parent=$rootFolderId) HTTP $code for ${file.name}")

            if (code in 200..299 && responseText.isNotBlank()) {
                val json = JSONObject(responseText)
                val fileId = json.optString("id", "")
                if (fileId.isNotBlank()) {
                    Log.d(TAG, "Google Drive upload successful for ${file.name}, fileId: $fileId")
                    return fileId
                }
            } else {
                Log.e(TAG, "Google Drive upload (parent=$rootFolderId) failed with HTTP $code: $responseText")
            }
            null
        } catch (e: Exception) {
            Log.e(TAG, "Error uploading file to Google Drive: ${file.name}", e)
            null
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Posts call JSON metadata to [DATA_ENDPOINT].
     * Returns true only on HTTP 2xx AND backend JSON success != false.
     */
    fun post(payload: JSONObject): Boolean {
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(DATA_ENDPOINT).openConnection() as HttpURLConnection).apply {
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
            Log.d(TAG, "Post call data HTTP $code, payload id=${payload.optLong("id")}, response: $responseText")

            val httpSuccess = code in 200..299
            var backendSuccess = httpSuccess
            if (httpSuccess && responseText.isNotBlank() && responseText.trim().startsWith("{")) {
                try {
                    val json = JSONObject(responseText)
                    if (json.has("success")) {
                        backendSuccess = json.optBoolean("success", false)
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to parse call data response JSON", e)
                }
            }

            val finalSuccess = httpSuccess && backendSuccess
            if (!finalSuccess) {
                Log.e(TAG, "Upload call data failed: HTTP $code, backendSuccess=$backendSuccess for payload id=${payload.optLong("id")}")
            }
            finalSuccess
        } catch (e: Exception) {
            Log.e(TAG, "Upload error for payload id=${payload.optLong("id")}", e)
            false
        } finally {
            connection?.disconnect()
        }
    }

    private fun getMimeType(extension: String): String? {
        if (extension.isEmpty()) return null
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.lowercase())
    }
}
