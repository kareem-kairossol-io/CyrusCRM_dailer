package com.sphinxtravel.CyrusCRM_ext.data.repository

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.util.Log
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.TABLE_CALLS
import com.sphinxtravel.CyrusCRM_ext.data.db.CallDatabaseHelper
import com.sphinxtravel.CyrusCRM_ext.data.model.CallRecord
import com.sphinxtravel.CyrusCRM_ext.data.model.UploadStatus

class SqliteCallRepository(context: Context) : CallRepository {

    companion object {
        private const val TAG = "CyrusSqliteCallRepo"
    }

    private val dbHelper = CallDatabaseHelper(context.applicationContext)

    override fun insertCall(call: CallRecord): Long {
        return try {
            val values = ContentValues().apply {
                put(Columns.CONTACT_NAME, call.contactName)
                put(Columns.PHONE_NUMBER, call.phoneNumber)
                put(Columns.DIRECTION, call.direction)
                put(Columns.STATUS, call.status)
                put(Columns.DURATION, call.duration)
                put(Columns.DATE, call.date)
                put(Columns.RECORDING_PATH, call.recordingPath)
                put(Columns.REF, call.ref)
                put(Columns.UPLOAD_STATUS, call.uploadStatus)
                put(Columns.GOOGLE_DRIVE_FILE_ID, call.googleDriveFileId)
                put(Columns.GOOGLE_DRIVE_FILE_URL, call.googleDriveFileUrl)
            }
            dbHelper.writableDatabase.insert(TABLE_CALLS, null, values)
        } catch (e: Exception) {
            Log.e(TAG, "Error inserting call record", e)
            -1L
        }
    }

    override fun getAllCalls(limit: Int?): List<CallRecord> {
        return try {
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
            cursor.use(::readAll)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all calls", e)
            emptyList()
        }
    }

    override fun getCallsSince(timestamp: Long): List<CallRecord> {
        return try {
            val cursor = dbHelper.readableDatabase.query(
                TABLE_CALLS,
                null,
                "${Columns.DATE} >= ?",
                arrayOf(timestamp.toString()),
                null,
                null,
                "${Columns.DATE} DESC"
            )
            cursor.use(::readAll)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting calls since $timestamp", e)
            emptyList()
        }
    }

    override fun getCallById(id: Long): CallRecord? {
        return try {
            val cursor = dbHelper.readableDatabase.query(
                TABLE_CALLS,
                null,
                "${Columns.ID} = ?",
                arrayOf(id.toString()),
                null,
                null,
                null
            )
            cursor.use { readAll(it).firstOrNull() }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting call by id $id", e)
            null
        }
    }

    override fun deleteCall(id: Long): Boolean {
        return try {
            val rows = dbHelper.writableDatabase.delete(
                TABLE_CALLS, "${Columns.ID} = ?", arrayOf(id.toString())
            )
            rows > 0
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting call id $id", e)
            false
        }
    }

    override fun deleteAll() {
        try {
            dbHelper.writableDatabase.delete(TABLE_CALLS, null, null)
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting all calls", e)
        }
    }

    override fun getCallsPendingUpload(): List<CallRecord> {
        return try {
            val cursor = dbHelper.readableDatabase.query(
                TABLE_CALLS,
                null,
                "${Columns.UPLOAD_STATUS} IN (?, ?)",
                arrayOf(UploadStatus.PENDING, UploadStatus.FAILED),
                null,
                null,
                "${Columns.DATE} ASC"
            )
            cursor.use(::readAll)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching calls pending upload", e)
            emptyList()
        }
    }

    override fun updateUploadStatus(id: Long, status: String): Boolean {
        return try {
            val values = ContentValues().apply {
                put(Columns.UPLOAD_STATUS, status)
            }
            val rows = dbHelper.writableDatabase.update(
                TABLE_CALLS,
                values,
                "${Columns.ID} = ?",
                arrayOf(id.toString())
            )
            rows > 0
        } catch (e: Exception) {
            Log.e(TAG, "Error updating upload status for call id=$id", e)
            false
        }
    }

    override fun updateGoogleDriveInfo(id: Long, fileId: String, fileUrl: String): Boolean {
        return try {
            val values = ContentValues().apply {
                put(Columns.GOOGLE_DRIVE_FILE_ID, fileId)
                put(Columns.GOOGLE_DRIVE_FILE_URL, fileUrl)
            }
            val rows = dbHelper.writableDatabase.update(
                TABLE_CALLS,
                values,
                "${Columns.ID} = ?",
                arrayOf(id.toString())
            )
            rows > 0
        } catch (e: Exception) {
            Log.e(TAG, "Error updating Google Drive info for call id=$id", e)
            false
        }
    }

    private fun readAll(cursor: Cursor): List<CallRecord> {
        val calls = mutableListOf<CallRecord>()
        val refIndex = cursor.getColumnIndex(Columns.REF)
        val uploadStatusIndex = cursor.getColumnIndex(Columns.UPLOAD_STATUS)
        val driveIdIndex = cursor.getColumnIndex(Columns.GOOGLE_DRIVE_FILE_ID)
        val driveUrlIndex = cursor.getColumnIndex(Columns.GOOGLE_DRIVE_FILE_URL)

        while (cursor.moveToNext()) {
            val refValue = if (refIndex != -1) cursor.getString(refIndex) else null
            val uploadStatusValue = if (uploadStatusIndex != -1) {
                cursor.getString(uploadStatusIndex) ?: UploadStatus.PENDING
            } else {
                UploadStatus.PENDING
            }
            val driveIdValue = if (driveIdIndex != -1) cursor.getString(driveIdIndex) else null
            val driveUrlValue = if (driveUrlIndex != -1) cursor.getString(driveUrlIndex) else null

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
                    ref = refValue,
                    uploadStatus = uploadStatusValue,
                    googleDriveFileId = driveIdValue,
                    googleDriveFileUrl = driveUrlValue
                )
            )
        }
        return calls
    }
}
