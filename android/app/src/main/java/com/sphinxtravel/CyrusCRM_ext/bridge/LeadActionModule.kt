package com.sphinxtravel.CyrusCRM_ext.bridge

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.sphinxtravel.CyrusCRM_ext.data.model.LeadAction
import com.sphinxtravel.CyrusCRM_ext.data.repository.LeadActionRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteLeadActionRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Exposes locally stored lead actions to JS as `NativeModules.LeadActionModule`.
 * SQLite access runs on Dispatchers.IO so it never blocks the RN bridge thread.
 */
class LeadActionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val MODULE_NAME = "LeadActionModule"
        private const val ERR_CREATE = "ERR_CREATE_LEAD_ACTION"
        private const val ERR_READ = "ERR_READ_LEAD_ACTIONS"
        private const val ERR_DELETE = "ERR_DELETE_LEAD_ACTION"
    }

    override fun getName() = MODULE_NAME

    private val repository: LeadActionRepository by lazy { SqliteLeadActionRepository(reactContext) }
    private val moduleScope = CoroutineScope(Dispatchers.IO)

    /**
     * Creates a new action for a given lead.
     * If [date] is <= 0, defaults to [System.currentTimeMillis].
     */
    @ReactMethod
    fun createAction(leadId: Double, number: String, date: Double, promise: Promise) {
        moduleScope.launch {
            try {
                val timestamp = if (date > 0) date.toLong() else System.currentTimeMillis()
                val action = LeadAction(
                    leadId = leadId.toLong(),
                    number = number,
                    date = timestamp
                )
                val rowId = repository.insertAction(action)
                promise.resolve(rowId.toDouble())
            } catch (e: Exception) {
                promise.reject(ERR_CREATE, e.message, e)
            }
        }
    }

    /** All stored lead actions, most recent first. */
    @ReactMethod
    fun getAllActions(promise: Promise) {
        moduleScope.launch {
            try {
                val actions = repository.getAllActions()
                promise.resolve(LeadActionMapper.toWritableArray(actions))
            } catch (e: Exception) {
                promise.reject(ERR_READ, e.message, e)
            }
        }
    }

    /** Actions for a specific lead. */
    @ReactMethod
    fun getActionsByLead(leadId: Double, promise: Promise) {
        moduleScope.launch {
            try {
                val actions = repository.getActionsByLead(leadId.toLong())
                promise.resolve(LeadActionMapper.toWritableArray(actions))
            } catch (e: Exception) {
                promise.reject(ERR_READ, e.message, e)
            }
        }
    }

    /** A single action by id, or null if not found. */
    @ReactMethod
    fun getActionById(id: Double, promise: Promise) {
        moduleScope.launch {
            try {
                val action = repository.getActionById(id.toLong())
                promise.resolve(action?.let { LeadActionMapper.toWritableMap(it) })
            } catch (e: Exception) {
                promise.reject(ERR_READ, e.message, e)
            }
        }
    }

    @ReactMethod
    fun deleteAction(id: Double, promise: Promise) {
        moduleScope.launch {
            try {
                promise.resolve(repository.deleteAction(id.toLong()))
            } catch (e: Exception) {
                promise.reject(ERR_DELETE, e.message, e)
            }
        }
    }

    @ReactMethod
    fun deleteAllActions(promise: Promise) {
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
