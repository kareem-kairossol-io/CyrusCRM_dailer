package com.sphinxtravel.CyrusCRM_ext.work

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.sphinxtravel.CyrusCRM_ext.upload.CallUploadService

/**
 * Orchestrator only: delegates the actual upload/status-update logic to
 * [CallUploadService]. Always returns success — individual call failures are
 * tracked via upload_status = FAILED and retried on the next wake-up, not by
 * failing/retrying the whole WorkManager job.
 */
class CallUploadWorker(appContext: Context, params: WorkerParameters) :
    CoroutineWorker(appContext, params) {

    companion object {
        private const val TAG = "CyrusCallUploadWorker"
    }

    private val uploadService by lazy { CallUploadService(applicationContext) }

    override suspend fun doWork(): Result {
        return try {
            uploadService.processQueue()
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error running upload queue", e)
            Result.failure()
        }
    }
}
