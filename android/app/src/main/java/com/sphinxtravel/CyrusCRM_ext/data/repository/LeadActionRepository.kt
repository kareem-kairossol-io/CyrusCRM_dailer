package com.sphinxtravel.CyrusCRM_ext.data.repository

import com.sphinxtravel.CyrusCRM_ext.data.model.LeadAction

/**
 * Storage-agnostic contract for lead actions.
 */
interface LeadActionRepository {
    fun insertAction(action: LeadAction): Long
    fun getAllActions(limit: Int? = null): List<LeadAction>
    fun getActionsByLead(leadId: Long): List<LeadAction>
    fun getActionById(id: Long): LeadAction?
    fun deleteAction(id: Long): Boolean
    fun deleteAll()
}
