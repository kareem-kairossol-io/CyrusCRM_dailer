package com.sphinxtravel.CyrusCRM_ext.data.model

/**
 * Plain domain model for a stored lead action. Used by the repository and
 * the React Native bridge — nothing in this file knows about SQLite or React.
 */
data class LeadAction(
    val id: Long = 0,
    val leadId: Long,
    val number: String,
    val date: Long
)
