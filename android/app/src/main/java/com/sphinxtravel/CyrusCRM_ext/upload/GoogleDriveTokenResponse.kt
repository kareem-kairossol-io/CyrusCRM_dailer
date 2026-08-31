package com.sphinxtravel.CyrusCRM_ext.upload

data class GoogleDriveTokenResponse(
    val accessToken: String,
    val tokenType: String,
    val expiresInSeconds: Long,
    val rootFolderId: String,
    val userFolderName: String? = null,
    val userFolderId: String? = null
)
