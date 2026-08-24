package com.sphinxtravel.CyrusCRM_ext.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.telephony.TelephonyManager
import android.util.Log
import com.sphinxtravel.CyrusCRM_ext.work.CallRecordingWorkScheduler

class CallStateReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "CyrusCallStateReceiver"
        private const val PREFS_NAME = "cyrus_sync_state"
        private const val KEY_LAST_STATE = "last_call_state"

        private fun prefs(context: Context): SharedPreferences =
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "Broadcast received: action=$action")

        if (action == Intent.ACTION_NEW_OUTGOING_CALL) {
            val outgoingNum = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER) ?: ""
            Log.d(TAG, "NEW_OUTGOING_CALL detected: number=$outgoingNum")
            return
        }

        if (action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val newState = when (stateStr) {
            TelephonyManager.EXTRA_STATE_RINGING -> "RINGING"
            TelephonyManager.EXTRA_STATE_OFFHOOK -> "OFFHOOK"
            else -> "IDLE"
        }

        val p = prefs(context)
        val lastState = p.getString(KEY_LAST_STATE, "IDLE")
        if (newState == lastState) return

        p.edit().putString(KEY_LAST_STATE, newState).apply()
        Log.d(TAG, "PHONE_STATE transition: $lastState -> $newState")

        // Call ended and returned to idle -> trigger a sync.
        if (newState == "IDLE" && (lastState == "OFFHOOK" || lastState == "RINGING")) {
            Log.d(TAG, "Triggering immediate CallSyncWorker from Receiver...")
            CallRecordingWorkScheduler.scheduleCallSyncNow(context)
        }
    }
}
