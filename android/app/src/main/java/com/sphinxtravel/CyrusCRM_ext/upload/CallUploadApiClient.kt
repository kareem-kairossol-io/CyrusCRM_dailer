package com.sphinxtravel.CyrusCRM_ext.upload

import android.util.Log
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class CallUploadApiClient {

    companion object {
        private const val TAG = "CyrusCallUploadApiClient"
        private const val ENDPOINT = "http://82.29.168.80:3000/api/data"
        private const val CONNECT_TIMEOUT_MS = 15_000
        private const val READ_TIMEOUT_MS = 15_000
    }

    /** Returns true on HTTP 2xx, false otherwise (including on any exception). */
    fun post(payload: JSONObject): Boolean {
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                doOutput = true
                connectTimeout = CONNECT_TIMEOUT_MS
                readTimeout = READ_TIMEOUT_MS
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
            }
            connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }

            val code = connection.responseCode
            val success = code in 200..299
            if (!success) {
                Log.e(TAG, "Upload failed, HTTP $code for payload id=${payload.optLong("id")}")
            }
            success
        } catch (e: Exception) {
            Log.e(TAG, "Upload error for payload id=${payload.optLong("id")}", e)
            false
        } finally {
            connection?.disconnect()
        }
    }
}
