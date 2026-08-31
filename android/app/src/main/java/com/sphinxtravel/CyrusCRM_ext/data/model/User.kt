package com.sphinxtravel.CyrusCRM_ext.data.model

data class User(
    val id: String,
    val userName: String,
    val fullName: String,
    val email: String,
    val roles: List<String>
)
