package com.sphinxtravel.CyrusCRM_ext.data.repository

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionContract.TABLE_LEAD_ACTIONS
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionDatabaseHelper
import com.sphinxtravel.CyrusCRM_ext.data.model.LeadAction

class SqliteLeadActionRepository(context: Context) : LeadActionRepository {

    private val dbHelper = LeadActionDatabaseHelper(context.applicationContext)

    override fun insertAction(action: LeadAction): Long {
        val values = ContentValues().apply {
            put(Columns.LEAD_ID, action.leadId)
            put(Columns.NUMBER, action.number)
            put(Columns.DATE, action.date)
        }
        return dbHelper.writableDatabase.insert(TABLE_LEAD_ACTIONS, null, values)
    }

    override fun getAllActions(limit: Int?): List<LeadAction> {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_LEAD_ACTIONS,
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

    override fun getActionsByLead(leadId: Long): List<LeadAction> {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_LEAD_ACTIONS,
            null,
            "${Columns.LEAD_ID} = ?",
            arrayOf(leadId.toString()),
            null,
            null,
            "${Columns.DATE} DESC"
        )
        return cursor.use(::readAll)
    }

    override fun getActionById(id: Long): LeadAction? {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_LEAD_ACTIONS,
            null,
            "${Columns.ID} = ?",
            arrayOf(id.toString()),
            null,
            null,
            null
        )
        return cursor.use { readAll(it).firstOrNull() }
    }

    override fun deleteAction(id: Long): Boolean {
        val rows = dbHelper.writableDatabase.delete(
            TABLE_LEAD_ACTIONS, "${Columns.ID} = ?", arrayOf(id.toString())
        )
        return rows > 0
    }

    override fun deleteAll() {
        dbHelper.writableDatabase.delete(TABLE_LEAD_ACTIONS, null, null)
    }

    private fun readAll(cursor: Cursor): List<LeadAction> {
        val actions = mutableListOf<LeadAction>()
        while (cursor.moveToNext()) {
            actions.add(
                LeadAction(
                    id = cursor.getLong(cursor.getColumnIndexOrThrow(Columns.ID)),
                    leadId = cursor.getLong(cursor.getColumnIndexOrThrow(Columns.LEAD_ID)),
                    number = cursor.getString(cursor.getColumnIndexOrThrow(Columns.NUMBER)),
                    date = cursor.getLong(cursor.getColumnIndexOrThrow(Columns.DATE))
                )
            )
        }
        return actions
    }
}
