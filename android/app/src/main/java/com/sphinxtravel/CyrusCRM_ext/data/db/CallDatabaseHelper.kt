package com.sphinxtravel.CyrusCRM_ext.data.db

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.DATABASE_NAME
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.DATABASE_VERSION
import com.sphinxtravel.CyrusCRM_ext.data.db.CallContract.TABLE_CALLS

/**
 * Owns schema creation/upgrades only. Reading/writing rows is the
 * repository's job (see [com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteCallRepository]).
 */
class CallDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context.applicationContext, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE $TABLE_CALLS (
                ${Columns.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
                ${Columns.CONTACT_NAME} TEXT,
                ${Columns.PHONE_NUMBER} TEXT,
                ${Columns.DIRECTION} TEXT,
                ${Columns.STATUS} TEXT,
                ${Columns.DURATION} INTEGER,
                ${Columns.DATE} INTEGER,
                ${Columns.RECORDING_PATH} TEXT,
                ${Columns.REF} TEXT
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            try {
                db.execSQL("ALTER TABLE $TABLE_CALLS ADD COLUMN ${Columns.REF} TEXT")
            } catch (e: Exception) {
                db.execSQL("DROP TABLE IF EXISTS $TABLE_CALLS")
                onCreate(db)
            }
        } else {
            db.execSQL("DROP TABLE IF EXISTS $TABLE_CALLS")
            onCreate(db)
        }
    }
}
