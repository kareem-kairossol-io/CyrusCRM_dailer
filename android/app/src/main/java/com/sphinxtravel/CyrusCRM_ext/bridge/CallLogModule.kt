package com.sphinxtravel.CyrusCRM_ext.bridge

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.sphinxtravel.CyrusCRM_ext.data.repository.CallRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteCallRepository
import com.sphinxtravel.CyrusCRM_ext.work.CallRecordingWorkScheduler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Exposes the locally stored call log to JS as `NativeModules.CallLogModule`.
 * SQLite access runs on Dispatchers.IO so it never blocks the RN bridge thread.
 */
class CallLogModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val MODULE_NAME = "CallLogModule"
        private const val ERR_READ = "ERR_READ_CALLS"
        private const val ERR_DELETE = "ERR_DELETE_CALL"
        private const val ERR_UPLOAD = "ERR_UPLOAD_RETRY"
        private const val ERR_CALL = "ERR_MAKE_CALL"
    }

    override fun getName() = MODULE_NAME

    private val repository: CallRepository by lazy { SqliteCallRepository(reactContext) }
    private val moduleScope = CoroutineScope(Dispatchers.IO)

    /** All stored calls, most recent first. */
    @ReactMethod
    fun getCalls(promise: Promise) {
        moduleScope.launch {
            try {
                promise.resolve(CallRecordMapper.toWritableArray(repository.getAllCalls()))
            } catch (e: Exception) {
                promise.reject(ERR_READ, e.message, e)
            }
        }
    }

    /** Calls at/after [timestamp] (epoch millis) — handy for incremental sync from JS. */
    @ReactMethod
    fun getCallsSince(timestamp: Double, promise: Promise) {
        moduleScope.launch {
            try {
                val calls = repository.getCallsSince(timestamp.toLong())
                promise.resolve(CallRecordMapper.toWritableArray(calls))
            } catch (e: Exception) {
                promise.reject(ERR_READ, e.message, e)
            }
        }
    }

    /** A single call by id, or null if it doesn't exist. */
    @ReactMethod
    fun getCallById(id: Double, promise: Promise) {
        moduleScope.launch {
            try {
                val call = repository.getCallById(id.toLong())
                promise.resolve(call?.let { CallRecordMapper.toWritableMap(it) })
            } catch (e: Exception) {
                promise.reject(ERR_READ, e.message, e)
            }
        }
    }

    @ReactMethod
    fun deleteCall(id: Double, promise: Promise) {
        moduleScope.launch {
            try {
                promise.resolve(repository.deleteCall(id.toLong()))
            } catch (e: Exception) {
                promise.reject(ERR_DELETE, e.message, e)
            }
        }
    }

    @ReactMethod
    fun deleteAllCalls(promise: Promise) {
        moduleScope.launch {
            try {
                repository.deleteAll()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(ERR_DELETE, e.message, e)
            }
        }
    }

    @ReactMethod
    fun retryFailedUploads(promise: Promise) {
        moduleScope.launch {
            try {
                CallRecordingWorkScheduler.scheduleUploadQueueNow(reactContext)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(ERR_UPLOAD, e.message, e)
            }
        }
    }

    /**
     * Directly places a call (or displays the system SIM selector dialog on Dual SIM devices)
     * without opening the dialer keypad screen.
     */
    @ReactMethod
    fun makeDirectCall(number: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject(ERR_CALL, e.message, e)
        }
    }
}
