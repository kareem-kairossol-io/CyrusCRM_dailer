package com.sphinxtravel.CyrusCRM_ext.data.db

/** Single source of truth for Auth SQLite table/column names. */
object AuthContract {
    const val DATABASE_NAME = "cyrus_crm_auth.db"
    const val DATABASE_VERSION = 1
    const val TABLE_AUTH = "auth_session"

    object Columns {
        const val ID = "id"
        const val TOKEN = "token"
        const val EXPIRATION = "expiration"
        const val USER_ID = "user_id"
        const val USERNAME = "username"
        const val FULL_NAME = "full_name"
        const val EMAIL = "email"
        const val ROLES = "roles"
        const val UPDATED_AT = "updated_at"
    }
}
