package com.sphinxtravel.CyrusCRM_ext.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord

object CallRecordMapper {

    fun toWritableMap(call: CallRecord): WritableMap = Arguments.createMap().apply {
        putDouble("id", call.id.toDouble())
        putString("contactName", call.contactName)
        putString("phoneNumber", call.phoneNumber)
        putString("direction", call.direction)
        putString("status", call.status)
        putDouble("duration", call.duration.toDouble())
        putDouble("date", call.date.toDouble())
        putString("recordingPath", call.recordingPath)
        putString("ref", call.ref)
        putString("uploadStatus", call.uploadStatus)
        putString("googleDriveFileId", call.googleDriveFileId)
        putString("googleDriveFileUrl", call.googleDriveFileUrl)
    }

    fun toWritableArray(calls: List<CallRecord>): WritableArray = Arguments.createArray().apply {
        calls.forEach { pushMap(toWritableMap(it)) }
    }
}
