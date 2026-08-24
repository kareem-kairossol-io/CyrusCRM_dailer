package com.sphinxtravel.CyrusCRM_ext.data.db

/** Single source of truth for table/column names. */
object LeadActionContract {
    const val DATABASE_NAME = "cyrus_crm_lead_actions.db"
    const val DATABASE_VERSION = 1
    const val TABLE_LEAD_ACTIONS = "lead_actions"

    object Columns {
        const val ID = "id"
        const val LEAD_ID = "lead_id"
        const val NUMBER = "number"
        const val DATE = "date"
    }
}
