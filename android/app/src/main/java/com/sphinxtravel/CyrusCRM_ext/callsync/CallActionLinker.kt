package com.sphinxtravel.CyrusCRM_ext.callsync

import android.content.Context
import android.util.Log
import com.sphinxtravel.CyrusCRM_ext.data.repository.LeadActionRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteLeadActionRepository

/**
 * Service responsible for matching received calls with recorded lead actions
 * by phone number and call time window [startTime..endTime + buffer], and clearing
 * lead actions after processing.
 */
class CallActionLinker(private val context: Context) {

    companion object {
        private const val TAG = "CyrusCallActionLinker"
        // Buffer interval: 5 minutes time window
        private const val BUFFER_MS = 5 * 60 * 1000L
    }

    private val leadActionRepository: LeadActionRepository by lazy {
        SqliteLeadActionRepository(context)
    }

    /**
     * Tries to find a lead action matching [phoneNumber] within the call time interval:
     * [callStartTime - BUFFER_MS] to [(callStartTime + durationMs) + BUFFER_MS].
     * Maximum interval allowed is 5 minutes (300,000 ms).
     * Returns the matched lead's reference code string (e.g. "REF-101"), or null if no match.
     */
    fun findMatchingRef(phoneNumber: String, callStartTime: Long, durationSeconds: Long): String? {
        return try {
            val durationMs = durationSeconds * 1000L
            val callEndTime = callStartTime + durationMs
            val windowStart = callStartTime - BUFFER_MS
            val windowEnd = callEndTime + BUFFER_MS

            val actions = leadActionRepository.getAllActions()
            val targetClean = cleanPhoneNumber(phoneNumber)

            val matchedAction = actions.firstOrNull { action ->
                val actionClean = cleanPhoneNumber(action.number)
                val isPhoneMatch =
                    actionClean.isNotEmpty() &&
                    targetClean.isNotEmpty() &&
                    (actionClean.endsWith(targetClean) || targetClean.endsWith(actionClean))
                val isTimeMatch = action.date in windowStart..windowEnd
                isPhoneMatch && isTimeMatch
            }

            matchedAction?.let { "REF-${it.leadId}" }
        } catch (e: Exception) {
            Log.e(TAG, "Error looking up matching lead action", e)
            null
        }
    }

    /**
     * Clears all lead actions from SQLite after call processing as requested.
     */
    fun clearLeadActions() {
        try {
            leadActionRepository.deleteAll()
            Log.d(TAG, "Successfully cleared lead actions from SQLite after call sync.")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to clear lead actions", e)
        }
    }

    private fun cleanPhoneNumber(phone: String): String =
        phone.replace("+", "").replace(" ", "").replace("-", "").takeLast(8)
}
