package com.sphinxtravel.CyrusCRM_ext.data.repository

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthContract.Columns
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthContract.TABLE_AUTH
import com.sphinxtravel.CyrusCRM_ext.data.db.AuthDatabaseHelper
import com.sphinxtravel.CyrusCRM_ext.data.model.AuthSession
import com.sphinxtravel.CyrusCRM_ext.data.model.User
import org.json.JSONArray

class SqliteAuthRepository(context: Context) : AuthRepository {

    private val dbHelper = AuthDatabaseHelper(context.applicationContext)

    override fun saveSession(session: AuthSession): Boolean {
        val rolesJson = JSONArray(session.user.roles).toString()
        val values = ContentValues().apply {
            put(Columns.ID, 1)
            put(Columns.TOKEN, session.token)
            put(Columns.EXPIRATION, session.expiration)
            put(Columns.USER_ID, session.user.id)
            put(Columns.USERNAME, session.user.userName)
            put(Columns.FULL_NAME, session.user.fullName)
            put(Columns.EMAIL, session.user.email)
            put(Columns.ROLES, rolesJson)
            put(Columns.UPDATED_AT, System.currentTimeMillis())
        }
        val result = dbHelper.writableDatabase.insertWithOnConflict(
            TABLE_AUTH,
            null,
            values,
            SQLiteDatabase.CONFLICT_REPLACE
        )
        return result != -1L
    }

    override fun getSession(): AuthSession? {
        val cursor = dbHelper.readableDatabase.query(
            TABLE_AUTH,
            null,
            "${Columns.ID} = 1",
            null,
            null,
            null,
            null
        )
        return cursor.use {
            if (it.moveToFirst()) {
                val token = it.getString(it.getColumnIndexOrThrow(Columns.TOKEN))
                val expiration = it.getString(it.getColumnIndexOrThrow(Columns.EXPIRATION)) ?: ""
                val userId = it.getString(it.getColumnIndexOrThrow(Columns.USER_ID))
                val userName = it.getString(it.getColumnIndexOrThrow(Columns.USERNAME))
                val fullName = it.getString(it.getColumnIndexOrThrow(Columns.FULL_NAME)) ?: ""
                val email = it.getString(it.getColumnIndexOrThrow(Columns.EMAIL)) ?: ""
                val rolesStr = it.getString(it.getColumnIndexOrThrow(Columns.ROLES)) ?: "[]"
                
                val rolesList = mutableListOf<String>()
                try {
                    val jsonArray = JSONArray(rolesStr)
                    for (i in 0 until jsonArray.length()) {
                        rolesList.add(jsonArray.getString(i))
                    }
                } catch (_: Exception) {}

                val user = User(
                    id = userId,
                    userName = userName,
                    fullName = fullName,
                    email = email,
                    roles = rolesList
                )
                AuthSession(token = token, expiration = expiration, user = user)
            } else {
                null
            }
        }
    }

    override fun getToken(): String? {
        return getSession()?.token
    }

    override fun getUser(): User? {
        return getSession()?.user
    }

    override fun updateUser(user: User): Boolean {
        val session = getSession() ?: return false
        val updatedSession = session.copy(user = user)
        return saveSession(updatedSession)
    }

    override fun clearSession() {
        dbHelper.writableDatabase.delete(TABLE_AUTH, null, null)
    }
}
