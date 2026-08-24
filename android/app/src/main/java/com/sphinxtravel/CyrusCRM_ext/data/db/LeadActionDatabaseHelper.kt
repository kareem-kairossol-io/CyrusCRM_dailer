package com.sphinxtravel.CyrusCRM_ext.data.db

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionContract.DATABASE_NAME
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionContract.DATABASE_VERSION
import com.sphinxtravel.CyrusCRM_ext.data.db.LeadActionContract.TABLE_LEAD_ACTIONS

/**
 * Owns schema creation/upgrades only. Reading/writing rows is the
 * repository's job (see [com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteLeadActionRepository]).
 */
class LeadActionDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context.applicationContext, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE $TABLE_LEAD_ACTIONS (
                ${Columns.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
                ${Columns.LEAD_ID} INTEGER NOT NULL,
                ${Columns.NUMBER} TEXT,
                ${Columns.DATE} INTEGER NOT NULL
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_LEAD_ACTIONS")
        onCreate(db)
    }
}
