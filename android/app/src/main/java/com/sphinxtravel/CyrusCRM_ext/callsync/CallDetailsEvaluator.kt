package com.sphinxtravel.CyrusCRM_ext.callsync

import android.provider.CallLog

data class CallDetails(
    val direction: String,
    val status: String
)

/**
 * Pure function, no Android context/IO needed — easy to unit test on its own.
 */
object CallDetailsEvaluator {

    fun evaluate(type: Int, duration: Long): CallDetails {
        val direction = when (type) {
            CallLog.Calls.OUTGOING_TYPE -> "OUTGOING"
            CallLog.Calls.INCOMING_TYPE,
            CallLog.Calls.MISSED_TYPE,
            CallLog.Calls.REJECTED_TYPE,
            CallLog.Calls.BLOCKED_TYPE -> "INCOMING"
            else -> "UNKNOWN"
        }

        val status = when (type) {
            CallLog.Calls.MISSED_TYPE,
            CallLog.Calls.REJECTED_TYPE,
            CallLog.Calls.BLOCKED_TYPE -> "NO_ANSWER"
            else -> if (duration > 0) "ANSWERED" else "NO_ANSWER"
        }

        return CallDetails(direction = direction, status = status)
    }
}
