package com.sphinxtravel.CyrusCRM_ext.upload

import android.content.Context
import android.util.Log
import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord
import com.sphinxtravel.CyrusCRM_ext.data.model.UploadStatus
import com.sphinxtravel.CyrusCRM_ext.data.repository.CallRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteCallRepository

import java.io.File

/**
 * Service responsible for uploading pending/failed call records to the
 * backend and persisting the resulting upload_status back to SQLite.
 */
class CallUploadService(private val context: Context) {

    companion object {
        private const val TAG = "CyrusCallUploadService"
    }

    private val repository: CallRepository by lazy { SqliteCallRepository(context) }
    private val apiClient by lazy { CallUploadApiClient() }

    /** Uploads a single call and persists the resulting status. Returns true on success. */
    fun uploadOne(call: CallRecord): Boolean {
        return try {
            var recordingPathToSend = call.recordingPath
            val recordingFile = if (!call.recordingPath.isNullOrBlank()) File(call.recordingPath) else null

            if (recordingFile != null && recordingFile.exists() && recordingFile.isFile) {
                Log.d(TAG, "Recording file exists for call id=${call.id} at ${call.recordingPath}. Uploading recording file first...")
                val serverFileUrl = apiClient.uploadFile(call.recordingPath)
                if (serverFileUrl == null) {
                    Log.e(TAG, "Failed to upload recording file for call id=${call.id}. Marking upload as FAILED.")
                    repository.updateUploadStatus(call.id, UploadStatus.FAILED)
                    return false
                }
                Log.d(TAG, "Recording file uploaded successfully for call id=${call.id}, server URL=$serverFileUrl")
                recordingPathToSend = serverFileUrl
            } else if (!call.recordingPath.isNullOrBlank()) {
                Log.w(TAG, "Call id=${call.id} has recordingPath=${call.recordingPath} but file does not exist on disk.")
            }

            val updatedCall = call.copy(recordingPath = recordingPathToSend)
            val payload = CallUploadPayloadMapper.toJson(updatedCall)
            Log.d(TAG, "Posting call metadata to backend for call id=${call.id}: $payload")

            val success = apiClient.post(payload)
            val newStatus = if (success) UploadStatus.UPLOADED else UploadStatus.FAILED
            repository.updateUploadStatus(call.id, newStatus)
            Log.d(TAG, "Call id=${call.id} upload final result=$newStatus")
            success
        } catch (e: Exception) {
            Log.e(TAG, "Error uploading call id=${call.id}", e)
            repository.updateUploadStatus(call.id, UploadStatus.FAILED)
            false
        }
    }

    /**
     * Sweeps every PENDING/FAILED call (oldest first) and attempts to upload
     * each one sequentially. A failure on one call does not stop the sweep —
     * it will simply be retried on the next queue wake-up.
     */
    fun processQueue() {
        val queued = try {
            repository.getCallsPendingUpload()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read pending upload queue", e)
            emptyList()
        }

        if (queued.isEmpty()) {
            Log.d(TAG, "Upload queue empty, nothing to do.")
            return
        }

        Log.d(TAG, "Upload queue has ${queued.size} call(s) pending.")
        queued.forEach { call -> uploadOne(call) }
    }
}
