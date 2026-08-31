package com.sphinxtravel.CyrusCRM_ext.data.repository

import com.sphinxtravel.CyrusCRM_ext.data.model.AuthSession
import com.sphinxtravel.CyrusCRM_ext.data.model.User

interface AuthRepository {
    fun saveSession(session: AuthSession): Boolean
    fun getSession(): AuthSession?
    fun getToken(): String?
    fun getUser(): User?
    fun updateUser(user: User): Boolean
    fun clearSession()
}
