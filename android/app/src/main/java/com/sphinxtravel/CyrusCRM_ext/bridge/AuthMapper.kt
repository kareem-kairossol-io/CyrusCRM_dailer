package com.sphinxtravel.CyrusCRM_ext.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.sphinxtravel.CyrusCRM_ext.data.model.AuthSession
import com.sphinxtravel.CyrusCRM_ext.data.model.User

object AuthMapper {

    fun userToWritableMap(user: User): WritableMap = Arguments.createMap().apply {
        putString("id", user.id)
        putString("userName", user.userName)
        putString("fullName", user.fullName)
        putString("email", user.email)
        putArray("roles", rolesToWritableArray(user.roles))
    }

    fun sessionToWritableMap(session: AuthSession): WritableMap = Arguments.createMap().apply {
        putString("token", session.token)
        putString("expiration", session.expiration)
        putMap("user", userToWritableMap(session.user))
    }

    private fun rolesToWritableArray(roles: List<String>): WritableArray = Arguments.createArray().apply {
        roles.forEach { pushString(it) }
    }
}
