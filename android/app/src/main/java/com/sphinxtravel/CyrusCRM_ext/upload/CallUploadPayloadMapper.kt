package com.sphinxtravel.CyrusCRM_ext.upload

import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord
import org.json.JSONObject

object CallUploadPayloadMapper {

    fun toJson(call: CallRecord): JSONObject = JSONObject().apply {
        put("id", call.id)
        put("contactName", call.contactName)
        put("phoneNumber", call.phoneNumber)
        put("direction", call.direction)
        put("status", call.status)
        put("duration", call.duration)
        put("date", call.date)
        put("recordingPath", call.recordingPath)
        put("googleDriveFileId", call.googleDriveFileId ?: JSONObject.NULL)
        put("googleDriveFileUrl", call.googleDriveFileUrl ?: JSONObject.NULL)
        put("ref", call.ref ?: JSONObject.NULL)
    }
}
