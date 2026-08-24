package com.sphinxtravel.CyrusCRM_ext.bridge

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.sphinxtravel.CyrusCRM_ext.data.repository.CallRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteCallRepository
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
}
