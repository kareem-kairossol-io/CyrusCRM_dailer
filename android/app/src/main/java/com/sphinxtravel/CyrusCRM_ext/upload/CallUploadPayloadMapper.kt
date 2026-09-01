package com.sphinxtravel.CyrusCRM_ext.upload

import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CallUploadPayloadMapper {

    /**
     * Maps a [CallRecord] to a multipart/form-data key-value map for http://69.169.103.92:9000/api/mobile/calls/log:
     * - ContactName
     * - AudioRecordPath
     * - ExternalPhoneNumber
     * - CallDurationSeconds
     * - ServiceType
     * - CallStatus
     * - AudioFile
     * - LeadId
     * - CallType
     * - CallDateTime
     * - CompanyPhoneNumber
     * - Comment
     */
    fun toFormDataMap(call: CallRecord, companyPhoneNumber: String = "01004992322"): Map<String, String> {
        val callType = when (call.direction.uppercase(Locale.US)) {
            "INCOMING", "IN", "MISSED", "REJECTED" -> "In"
            "OUTGOING", "OUT" -> "Out"
            else -> if (call.direction.contains("IN", ignoreCase = true)) "In" else "Out"
        }

        val callStatus = when {
            call.status.equals("ANSWERED", ignoreCase = true) || call.duration > 0 -> "Answered"
            else -> "Missed"
        }

        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
        val callDateTimeStr = dateFormat.format(Date(call.date))

        val driveUrl = when {
            !call.googleDriveFileUrl.isNullOrBlank() -> call.googleDriveFileUrl
            !call.googleDriveFileId.isNullOrBlank() -> "https://drive.google.com/file/d/${call.googleDriveFileId}/view"
            else -> ""
        }

        val externalPhone = sanitizePhoneNumber(call.phoneNumber)
        val companyPhone = sanitizePhoneNumber(companyPhoneNumber)
        val contactName = if (call.contactName.isNotBlank() && call.contactName != "Unknown") call.contactName else "غير مسجل"

        return mapOf(
            "ContactName" to contactName,
            "AudioRecordPath" to driveUrl,
            "ExternalPhoneNumber" to externalPhone,
            "CallDurationSeconds" to call.duration.toString(),
            "ServiceType" to "0",
            "CallStatus" to callStatus,
            "AudioFile" to "",
            "LeadId" to (call.ref ?: ""),
            "CallType" to callType,
            "CallDateTime" to callDateTimeStr,
            "CompanyPhoneNumber" to companyPhone,
            "Comment" to ""
        )
    }

    private fun sanitizePhoneNumber(raw: String?): String {
        if (raw.isNullOrBlank()) return "01000000000"
        val trimmed = raw.trim()
        if (trimmed.equals("Unknown", ignoreCase = true) || trimmed.equals("Private", ignoreCase = true)) {
            return "01000000000"
        }
        val clean = trimmed.replace(Regex("[^0-9+]"), "")
        return if (clean.isBlank()) "01000000000" else clean
    }
}
