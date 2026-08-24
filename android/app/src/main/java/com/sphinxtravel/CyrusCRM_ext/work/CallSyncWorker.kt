package com.sphinxtravel.CyrusCRM_ext.work

import android.content.Context
import android.content.SharedPreferences
import android.database.Cursor
import android.provider.CallLog
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.sphinxtravel.CyrusCRM_ext.callsync.CallDetailsEvaluator
import com.sphinxtravel.CyrusCRM_ext.callsync.RecordingFileLocator
import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord
import com.sphinxtravel.CyrusCRM_ext.data.repository.CallRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteCallRepository

/**
 * Orchestrator only: reads the latest call-log row, delegates direction/status
 * evaluation to [CallDetailsEvaluator], delegates recording lookup to
 * [RecordingFileLocator], and persists the result through [CallRepository].
 */
class CallSyncWorker(appContext: Context, params: WorkerParameters) :
    CoroutineWorker(appContext, params) {

    companion object {
        private const val TAG = "CyrusCallSyncWorker"
        private const val PREFS_NAME = "cyrus_sync_state"
        private const val KEY_LAST_PROCESSED_CALL_DATE = "last_processed_call_date"
        private const val SETTLE_DELAY_MS = 2000L

        private fun prefs(context: Context): SharedPreferences =
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    private val repository: CallRepository by lazy { SqliteCallRepository(applicationContext) }
    private val recordingLocator by lazy { RecordingFileLocator(applicationContext) }

    override suspend fun doWork(): Result {
        return try {
            // Give the system call log a moment to fully settle before reading it.
            Thread.sleep(SETTLE_DELAY_MS)

            val latestCall = readLatestCallLogEntry()
            if (latestCall == null) {
                Log.d(TAG, "No call logs found.")
                return Result.success()
            }

            if (isDuplicate(latestCall.date)) {
                Log.d(TAG, "Duplicate trigger ignored for call timestamp: ${latestCall.date}")
                return Result.success()
            }
            markProcessed(latestCall.date)

            val callDetails = CallDetailsEvaluator.evaluate(latestCall.rawType, latestCall.duration)

            val recordingPath = if (callDetails.status == "ANSWERED" && latestCall.duration > 0) {
                recordingLocator.find(latestCall.number, latestCall.date) ?: "No recording found"
            } else {
                "No recording (Unanswered/0s duration)"
            }

            val record = CallRecord(
                contactName = latestCall.contactName,
                phoneNumber = latestCall.number,
                direction = callDetails.direction,
                status = callDetails.status,
                duration = latestCall.duration,
                date = latestCall.date,
                recordingPath = recordingPath
            )
            repository.insertCall(record)

            Log.d(TAG, buildLogSummary(record))
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error processing call log", e)
            Result.failure()
        }
    }

    private data class RawCallLogEntry(
        val number: String,
        val contactName: String,
        val rawType: Int,
        val date: Long,
        val duration: Long
    )

    private fun readLatestCallLogEntry(): RawCallLogEntry? {
        val resolver = applicationContext.contentResolver
        val cursor: Cursor? = resolver.query(
            CallLog.Calls.CONTENT_URI,
            arrayOf(
                CallLog.Calls.NUMBER,
                CallLog.Calls.CACHED_NAME,
                CallLog.Calls.TYPE,
                CallLog.Calls.DATE,
                CallLog.Calls.DURATION
            ),
            null,
            null,
            "${CallLog.Calls.DATE} DESC"
        )

        cursor?.use {
            if (!it.moveToFirst()) return null
            val nameIndex = it.getColumnIndex(CallLog.Calls.CACHED_NAME)
            return RawCallLogEntry(
                number = it.getString(it.getColumnIndexOrThrow(CallLog.Calls.NUMBER)) ?: "Unknown",
                contactName = if (nameIndex != -1) it.getString(nameIndex) ?: "غير مسجل" else "غير مسجل",
                rawType = it.getInt(it.getColumnIndexOrThrow(CallLog.Calls.TYPE)),
                date = it.getLong(it.getColumnIndexOrThrow(CallLog.Calls.DATE)),
                duration = it.getLong(it.getColumnIndexOrThrow(CallLog.Calls.DURATION))
            )
        }
        return null
    }

    private fun isDuplicate(date: Long): Boolean =
        prefs(applicationContext).getLong(KEY_LAST_PROCESSED_CALL_DATE, 0L) == date

    private fun markProcessed(date: Long) {
        prefs(applicationContext).edit().putLong(KEY_LAST_PROCESSED_CALL_DATE, date).apply()
    }

    private fun buildLogSummary(record: CallRecord) = """
        ================ CALL LOG DETECTED & SAVED TO SQLITE ================
        Contact Name   : ${record.contactName}
        Phone Number   : ${record.phoneNumber}
        Direction      : ${record.direction}
        Status         : ${record.status}
        Duration       : ${record.duration} seconds
        Date           : ${record.date}
        Recording Path : ${record.recordingPath}
        =====================================================================
    """.trimIndent()
}
