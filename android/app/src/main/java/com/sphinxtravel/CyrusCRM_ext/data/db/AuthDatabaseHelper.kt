package com.sphinxtravel.CyrusCRM_ext.data.db

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthContract.DATABASE_NAME
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthContract.DATABASE_VERSION
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthContract.TABLE_AUTH

/**
 * Manages creation & schema updates for auth_session SQLite table.
 */
class AuthDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context.applicationContext, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE $TABLE_AUTH (
                ${Columns.ID} INTEGER PRIMARY KEY CHECK (${Columns.ID} = 1),
                ${Columns.TOKEN} TEXT NOT NULL,
                ${Columns.EXPIRATION} TEXT,
                ${Columns.USER_ID} TEXT NOT NULL,
                ${Columns.USERNAME} TEXT NOT NULL,
                ${Columns.FULL_NAME} TEXT,
                ${Columns.EMAIL} TEXT,
                ${Columns.ROLES} TEXT,
                ${Columns.UPDATED_AT} INTEGER NOT NULL
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_AUTH")
        onCreate(db)
    }
}
