package com.sphinxtravel.CyrusCRM_ext.callsync

import android.content.Context
import android.os.Environment
import android.provider.MediaStore
import java.io.File

/**
 * Tries to find the audio file that matches a given call, first by checking
 * the well-known Samsung recording folders, then by scanning MediaStore.
 */
class RecordingFileLocator(private val context: Context) {

    companion object {
        private const val TIME_WINDOW_MS = 60_000L
        private const val MEDIASTORE_LOOKBACK_SECONDS = 120
    }

    fun find(phoneNumber: String, callTime: Long): String? =
        findSamsungRecording(phoneNumber, callTime) ?: findMediaStoreRecording(phoneNumber, callTime)

    private fun findSamsungRecording(phoneNumber: String, callTime: Long): String? {
        val root = Environment.getExternalStorageDirectory().absolutePath
        val samsungDirs = listOf(
            File("$root/Call"),
            File("$root/Recordings/Call"),
            File("$root/Sounds/CallRecord")
        )
        val cleanPhone = cleanPhoneNumber(phoneNumber)

        for (dir in samsungDirs) {
            if (!dir.exists() || !dir.isDirectory) continue
            val files = dir.listFiles() ?: continue

            val matched = files
                .filter { it.isFile && isAudioFile(it.name) }
                .sortedByDescending { it.lastModified() }
                .firstOrNull { file ->
                    val timeDiff = Math.abs(file.lastModified() - callTime)
                    file.name.contains(cleanPhone) || timeDiff < TIME_WINDOW_MS
                }

            if (matched != null) return matched.absolutePath
        }
        return null
    }

    private fun findMediaStoreRecording(phoneNumber: String, callTime: Long): String? {
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.DATE_ADDED,
            MediaStore.Audio.Media.DISPLAY_NAME
        )
        val selection = "${MediaStore.Audio.Media.DATE_ADDED} >= ?"
        val selectionArgs = arrayOf(((callTime / 1000) - MEDIASTORE_LOOKBACK_SECONDS).toString())
        val cleanPhone = cleanPhoneNumber(phoneNumber)

        val cursor = context.contentResolver.query(
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
            projection,
            selection,
            selectionArgs,
            "${MediaStore.Audio.Media.DATE_ADDED} DESC"
        )

        cursor?.use {
            val dataCol = it.getColumnIndex(MediaStore.Audio.Media.DATA)
            val nameCol = it.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)

            while (it.moveToNext()) {
                val filePath = if (dataCol != -1) it.getString(dataCol) else null
                val fileName = if (nameCol != -1) it.getString(nameCol) else ""

                if (fileName.contains(cleanPhone) || (filePath != null && filePath.contains("Call"))) {
                    return filePath ?: fileName
                }
            }
        }
        return null
    }

    private fun cleanPhoneNumber(phoneNumber: String) = phoneNumber.replace("+", "").takeLast(8)

    private fun isAudioFile(name: String) =
        name.endsWith(".m4a") || name.endsWith(".amr") || name.endsWith(".mp3")
}
