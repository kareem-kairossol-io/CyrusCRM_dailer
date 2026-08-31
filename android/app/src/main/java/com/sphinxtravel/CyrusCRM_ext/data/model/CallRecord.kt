package com.sphinxtravel.CyrusCRM_ext.data.model

/**
 * Plain domain model for a stored call. Used by the repository, the worker,
 * and the React Native bridge — nothing in this file knows about SQLite,
 * WorkManager, or React.
 */
data class CallRecord(
    val id: Long = 0,
    val contactName: String,
    val phoneNumber: String,
    val direction: String,      // "INCOMING" | "OUTGOING" | "UNKNOWN"
    val status: String,         // "ANSWERED" | "NO_ANSWER"
    val duration: Long,
    val date: Long,
    val recordingPath: String,
    val ref: String? = null,    // Nullable reference ID linked from lead_actions
    val uploadStatus: String = UploadStatus.PENDING,
    val googleDriveFileId: String? = null,
    val googleDriveFileUrl: String? = null
)
