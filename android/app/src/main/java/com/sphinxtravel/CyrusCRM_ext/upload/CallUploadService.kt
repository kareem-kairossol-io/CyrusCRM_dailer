package com.sphinxtravel.CyrusCRM_ext.upload

import android.content.Context
import android.util.Log
import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord
import com.sphinxtravel.CyrusCRM_ext.data.model.UploadStatus
import com.sphinxtravel.CyrusCRM_ext.data.repository.AuthRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.CallRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteAuthRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteCallRepository
import java.io.File

/**
 * Service responsible for uploading pending/failed call records directly to Google Drive,
 * persisting googleDriveFileId & googleDriveFileUrl in SQLite, and posting call metadata to backend.
 */
class CallUploadService(private val context: Context) {

    companion object {
        private const val TAG = "CyrusCallUploadService"
    }

    private val repository: CallRepository by lazy { SqliteCallRepository(context) }
    private val authRepository: AuthRepository by lazy { SqliteAuthRepository(context) }
    private val apiClient by lazy { CallUploadApiClient() }

    /** Uploads a single call recording to Google Drive & posts metadata. Returns true on success. */
    fun uploadOne(call: CallRecord): Boolean {
        return try {
            var driveFileId: String? = call.googleDriveFileId
            var driveFileUrl: String? = call.googleDriveFileUrl
            var recordingPathToSend = call.recordingPath

            val recordingFile = if (!call.recordingPath.isNullOrBlank()) File(call.recordingPath) else null

            // 1. Check idempotency: If file is already uploaded to Google Drive, reuse existing ID & URL
            if (!driveFileId.isNullOrBlank() && !driveFileUrl.isNullOrBlank()) {
                Log.d(TAG, "Call id=${call.id} recording already uploaded to Google Drive with fileId=$driveFileId. Skipping re-upload.")
                recordingPathToSend = driveFileUrl
            } else if (recordingFile != null && recordingFile.exists() && recordingFile.isFile) {
                Log.d(TAG, "Uploading recording file for call id=${call.id} directly to Google Drive...")

                // 2. Fetch short-lived Google Drive token from backend
                val appToken: String = authRepository.getToken() ?: ""
                if (appToken.isBlank()) {
                    Log.w(TAG, "No user session token found in SQLite auth repository for call id=${call.id}. User may need to log in.")
                }
                val tokenResponse = apiClient.fetchGoogleDriveToken(appToken)
                if (tokenResponse == null) {
                    Log.e(TAG, "Failed to obtain Google Drive token from backend for call id=${call.id}. Marking upload as FAILED.")
                    repository.updateUploadStatus(call.id, UploadStatus.FAILED)
                    return false
                }

                // 3. Upload binary audio file directly to user Google Drive folder (100% dynamic from API)
                val folderIdToUse = if (!tokenResponse.userFolderId.isNullOrBlank()) {
                    tokenResponse.userFolderId
                } else {
                    tokenResponse.rootFolderId
                }
                Log.d(TAG, "Uploading call id=${call.id} to Google Drive parent folderId=$folderIdToUse")

                val uploadedFileId = apiClient.uploadFileToGoogleDrive(
                    filePath = call.recordingPath,
                    fileName = recordingFile.name,
                    googleAccessToken = tokenResponse.accessToken,
                    rootFolderId = folderIdToUse
                )

                if (uploadedFileId == null) {
                    Log.e(TAG, "Failed to upload file to Google Drive for call id=${call.id}. Marking upload as FAILED.")
                    repository.updateUploadStatus(call.id, UploadStatus.FAILED)
                    return false
                }

                val generatedUrl = "https://drive.google.com/file/d/$uploadedFileId/view"
                driveFileId = uploadedFileId
                driveFileUrl = generatedUrl
                recordingPathToSend = generatedUrl

                // 4. Save Google Drive File ID and URL immediately to SQLite
                repository.updateGoogleDriveInfo(call.id, uploadedFileId, generatedUrl)
                Log.d(TAG, "Google Drive info saved to SQLite for call id=${call.id}: fileId=$uploadedFileId, url=$generatedUrl")
            } else if (!call.recordingPath.isNullOrBlank()) {
                Log.w(TAG, "Call id=${call.id} has recordingPath=${call.recordingPath} but file does not exist on disk.")
            }

            // 5. Post metadata JSON to backend endpoint
            val updatedCall = call.copy(
                recordingPath = recordingPathToSend,
                googleDriveFileId = driveFileId,
                googleDriveFileUrl = driveFileUrl
            )
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
