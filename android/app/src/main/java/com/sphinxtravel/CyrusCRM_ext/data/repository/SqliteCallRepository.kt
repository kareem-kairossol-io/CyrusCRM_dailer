package com.sphinxtravel.CyrusCRM_ext.data.repository

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.TABLE_CALLS
import com.sphinxtravel.CyrusCRM_ext.data.db.CallDatabaseHelper
import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord

class SqliteCallRepository(context: Context) : CallRepository {

    private val dbHelper = CallDatabaseHelper(context.applicationContext)

    override fun insertCall(call: CallRecord): Long {
        val values = ContentValues().apply {
            put(Columns.CONTACT_NAME, call.contactName)
            put(Columns.PHONE_NUMBER, call.phoneNumber)
            put(Columns.DIRECTION, call.direction)
            put(Columns.STATUS, call.status)
            put(Columns.DURATION, call.duration)
            put(Columns.DATE, call.date)
            put(Columns.RECORDING_PATH, call.recordingPath)
            put(Columns.REF, call.ref)
        }
        return dbHelper.writableDatabase.insert(TABLE_CALLS, null, values)
    }

    override fun getAllCalls(limit: Int?): List<CallRecord> {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_CALLS,
            null,
            null,
            null,
            null,
            null,
            "${Columns.DATE} DESC",
            limit?.toString()
        )
        return cursor.use(::readAll)
    }

    override fun getCallsSince(timestamp: Long): List<CallRecord> {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_CALLS,
            null,
            "${Columns.DATE} >= ?",
            arrayOf(timestamp.toString()),
            null,
            null,
            "${Columns.DATE} DESC"
        )
        return cursor.use(::readAll)
    }

    override fun getCallById(id: Long): CallRecord? {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_CALLS,
            null,
            "${Columns.ID} = ?",
            arrayOf(id.toString()),
            null,
            null,
            null
        )
        return cursor.use { readAll(it).firstOrNull() }
    }

    override fun deleteCall(id: Long): Boolean {
        val rows = dbHelper.writableDatabase.delete(
            TABLE_CALLS, "${Columns.ID} = ?", arrayOf(id.toString())
        )
        return rows > 0
    }

    override fun deleteAll() {
        dbHelper.writableDatabase.delete(TABLE_CALLS, null, null)
    }

    private fun readAll(cursor: Cursor): List<CallRecord> {
        val calls = mutableListOf<CallRecord>()
        val refIndex = cursor.getColumnIndex(Columns.REF)

        while (cursor.moveToNext()) {
            val refValue = if (refIndex != -1) cursor.getString(refIndex) else null

            calls.add(
                CallRecord(
                    id = cursor.getLong(cursor.getColumnIndexOrThrow(Columns.ID)),
                    contactName = cursor.getString(cursor.getColumnIndexOrThrow(Columns.CONTACT_NAME)),
                    phoneNumber = cursor.getString(cursor.getColumnIndexOrThrow(Columns.PHONE_NUMBER)),
                    direction = cursor.getString(cursor.getColumnIndexOrThrow(Columns.DIRECTION)),
                    status = cursor.getString(cursor.getColumnIndexOrThrow(Columns.STATUS)),
                    duration = cursor.getLong(cursor.getColumnIndexOrThrow(Columns.DURATION)),
                    date = cursor.getLong(cursor.getColumnIndexOrThrow(Columns.DATE)),
                    recordingPath = cursor.getString(cursor.getColumnIndexOrThrow(Columns.RECORDING_PATH)),
                    ref = refValue
                )
            )
        }
        return calls
    }
}
