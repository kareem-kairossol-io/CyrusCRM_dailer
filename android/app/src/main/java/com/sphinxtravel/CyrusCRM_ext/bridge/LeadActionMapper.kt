package com.sphinxtravel.CyrusCRM_ext.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.sphinxtravel.CyrusCRM_ext.data.model.LeadAction

object LeadActionMapper {

    fun toWritableMap(action: LeadAction): WritableMap = Arguments.createMap().apply {
        putDouble("id", action.id.toDouble())
        putDouble("leadId", action.leadId.toDouble())
        putString("number", action.number)
        putDouble("date", action.date.toDouble())
    }

    fun toWritableArray(actions: List<LeadAction>): WritableArray = Arguments.createArray().apply {
        actions.forEach { pushMap(toWritableMap(it)) }
    }
}
