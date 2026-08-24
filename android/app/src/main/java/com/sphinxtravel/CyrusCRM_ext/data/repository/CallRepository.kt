package com.sphinxtravel.CyrusCRM_ext.data.repository

import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord

/**
 * Storage-agnostic contract. Both [CallSyncWorker][com.sphinxtravel.CyrusCRM_ext.work.CallSyncWorker]
 * and the React Native bridge module depend on this interface, not on SQLite directly —
 * swapping storage later (Room, a remote API, etc.) only means writing a new implementation.
 */
interface CallRepository {
    fun insertCall(call: CallRecord): Long
    fun getAllCalls(limit: Int? = null): List<CallRecord>
    fun getCallsSince(timestamp: Long): List<CallRecord>
    fun getCallById(id: Long): CallRecord?
    fun deleteCall(id: Long): Boolean
    fun deleteAll()
}
