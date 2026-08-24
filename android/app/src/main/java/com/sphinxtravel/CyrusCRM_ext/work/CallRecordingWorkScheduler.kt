package com.sphinxtravel.CyrusCRM_ext.work

import android.content.Context
import android.os.Build
import android.provider.CallLog
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

object CallRecordingWorkScheduler {

    private const val TAG = "CyrusWorkScheduler"
    private const val TRIGGER_WORK_NAME = "CallLogContentUriTriggerWork"

    /** Run the worker immediately once a call ends. */
    fun scheduleCallSyncNow(context: Context) {
        try {
            val workRequest = OneTimeWorkRequestBuilder<CallSyncWorker>().build()
            WorkManager.getInstance(context).enqueue(workRequest)
            Log.d(TAG, "Enqueued CallSyncWorker request.")
        } catch (e: Exception) {
            Log.e(TAG, "Error enqueueing CallSyncWorker", e)
        }
    }

    /** Watch the system call log for changes as a fallback trigger. */
    fun scheduleCallLogTrigger(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                val constraints = Constraints.Builder()
                    .addContentUriTrigger(CallLog.Calls.CONTENT_URI, true)
                    .build()

                val workRequest = OneTimeWorkRequestBuilder<CallSyncWorker>()
                    .setConstraints(constraints)
                    .build()

                WorkManager.getInstance(context).enqueueUniqueWork(
                    TRIGGER_WORK_NAME,
                    ExistingWorkPolicy.REPLACE,
                    workRequest
                )
                Log.d(TAG, "OS ContentUriTrigger scheduled.")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to schedule ContentUriTrigger", e)
            }
        }
    }
}
