package com.sphinxtravel.CyrusCRM_ext.data.repository

import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord

/**
 * Storage-agnostic contract. Both [CallSyncWorker][com.sphinxtravel.CyrusCRM_ext.work.CallSyncWorker]
 * and the React Native bridge module depend on this interface, not on SQLite directly —
 * swapping storage later (Room, a remote API, etc.) only means writing a new implementation.
 */
interface CallRepository {
    fun insertCall(call: CallRecord): Long
    fun getAllCalls(limit: Int? = null): List<CallRecord>
    fun getCallsSince(timestamp: Long): List<CallRecord>
    fun getCallById(id: Long): CallRecord?
    fun deleteCall(id: Long): Boolean
    fun deleteAll()

    /** Calls with upload_status PENDING or FAILED, ordered oldest-first (by date ASC). */
    fun getCallsPendingUpload(): List<CallRecord>

    /** Updates just the upload_status column for a given call id. Returns true if a row was updated. */
    fun updateUploadStatus(id: Long, status: String): Boolean

    /** Updates google_drive_file_id and google_drive_file_url for a given call id. */
    fun updateGoogleDriveInfo(id: Long, fileId: String, fileUrl: String): Boolean
}
