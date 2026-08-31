package com.sphinxtravel.CyrusCRM_ext.data.model

data class AuthSession(
    val token: String,
    val expiration: String,
    val user: User
)
