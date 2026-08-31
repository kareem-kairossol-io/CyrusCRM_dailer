package com.sphinxtravel.CyrusCRM_ext.data.db

/** Single source of truth for table/column names. */
object CallContract {
    const val DATABASE_NAME = "cyrus_crm_calls.db"
    const val DATABASE_VERSION = 4
    const val TABLE_CALLS = "calls"

    object Columns {
        const val ID = "id"
        const val CONTACT_NAME = "contact_name"
        const val PHONE_NUMBER = "phone_number"
        const val DIRECTION = "direction"
        const val STATUS = "status"
        const val DURATION = "duration"
        const val DATE = "date"
        const val RECORDING_PATH = "recording_path"
        const val REF = "ref"
        const val UPLOAD_STATUS = "upload_status"
        const val GOOGLE_DRIVE_FILE_ID = "google_drive_file_id"
        const val GOOGLE_DRIVE_FILE_URL = "google_drive_file_url"
    }
}
