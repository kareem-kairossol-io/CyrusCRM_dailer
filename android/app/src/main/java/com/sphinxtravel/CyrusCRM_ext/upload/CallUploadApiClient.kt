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
        private const val DATA_ENDPOINT = "http://82.29.168.80:3000/api/data"
        private const val FILE_UPLOAD_ENDPOINT = "http://82.29.168.80:3000/api/upload"
        private const val CONNECT_TIMEOUT_MS = 15_000
        private const val READ_TIMEOUT_MS = 15_000
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

    /**
     * Uploads an audio recording file using multipart/form-data with field name "file"
     * to [FILE_UPLOAD_ENDPOINT].
     * Returns the server-assigned uploaded file URL/path on success (e.g. "/uploads/..."),
     * or null on failure.
     */
    fun uploadFile(filePath: String): String? {
        val file = File(filePath)
        if (!file.exists() || !file.isFile) {
            Log.e(TAG, "Recording file does not exist at path: $filePath")
            return null
        }

        var connection: HttpURLConnection? = null
        val boundary = "---CyrusCRMBoundary" + System.currentTimeMillis()
        val lineEnd = "\r\n"
        val twoHyphens = "--"

        return try {
            connection = (URL(FILE_UPLOAD_ENDPOINT).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                doOutput = true
                doInput = true
                useCaches = false
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                setRequestProperty("Connection", "Keep-Alive")
                setRequestProperty("User-Agent", "Android/CyrusCRM")
                setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            }

            val mimeType = getMimeType(file.extension) ?: "audio/mpeg"

            connection.outputStream.use { os ->
                val header = StringBuilder()
                    .append(twoHyphens).append(boundary).append(lineEnd)
                    .append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(file.name).append("\"").append(lineEnd)
                    .append("Content-Type: ").append(mimeType).append(lineEnd)
                    .append(lineEnd)
                    .toString()

                os.write(header.toByteArray(Charsets.UTF_8))

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
            Log.d(TAG, "File upload HTTP $code for ${file.name}, response: $responseText")

            if (code in 200..299) {
                if (responseText.isNotBlank() && responseText.trim().startsWith("{")) {
                    val json = JSONObject(responseText)
                    val success = json.optBoolean("success", true)
                    if (success) {
                        val filesArray = json.optJSONArray("files")
                        val fileObj = filesArray?.optJSONObject(0)
                        val url = fileObj?.optString("url") ?: fileObj?.optString("storedName") ?: file.name
                        Log.d(TAG, "File uploaded successfully, server URL: $url")
                        return url
                    } else {
                        Log.e(TAG, "File upload backend returned success=false: $responseText")
                    }
                } else {
                    return file.name
                }
            } else {
                Log.e(TAG, "File upload failed with HTTP $code: $responseText")
            }
            null
        } catch (e: Exception) {
            Log.e(TAG, "Error uploading file ${file.name}", e)
            null
        } finally {
            connection?.disconnect()
        }
    }

    private fun getMimeType(extension: String): String? {
        if (extension.isEmpty()) return null
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.lowercase())
    }
}
