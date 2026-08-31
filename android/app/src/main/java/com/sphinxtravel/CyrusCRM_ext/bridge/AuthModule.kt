package com.sphinxtravel.CyrusCRM_ext.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.sphinxtravel.CyrusCRM_ext.data.repository.AuthRepository
import com.sphinxtravel.CyrusCRM_ext.data.repository.SqliteAuthRepository
import com.sphinxtravel.CyrusCRM_ext.network.AuthApiClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Exposes native auth logic and SQLite session storage to JS as `NativeModules.AuthModule`.
 * All network and SQLite operations run on Dispatchers.IO.
 */
class AuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val MODULE_NAME = "AuthModule"
        private const val ERR_LOGIN = "ERR_LOGIN_FAILED"
        private const val ERR_GET_PROFILE = "ERR_GET_PROFILE_FAILED"
        private const val ERR_AUTH = "ERR_AUTH"
    }

    override fun getName() = MODULE_NAME

    private val authRepository: AuthRepository by lazy { SqliteAuthRepository(reactContext) }
    private val apiClient: AuthApiClient by lazy {
        AuthApiClient(reactContext) {
            emitUnauthorizedEvent()
        }
    }
    private val moduleScope = CoroutineScope(Dispatchers.IO)

    @ReactMethod
    fun login(usernameOrEmail: String, password: String, promise: Promise) {
        moduleScope.launch {
            val result = apiClient.login(usernameOrEmail, password)
            result.fold(
                onSuccess = { session ->
                    promise.resolve(AuthMapper.sessionToWritableMap(session))
                },
                onFailure = { error ->
                    promise.reject(ERR_LOGIN, error.message, error)
                }
            )
        }
    }

    @ReactMethod
    fun getMe(promise: Promise) {
        moduleScope.launch {
            val result = apiClient.getMe()
            result.fold(
                onSuccess = { user ->
                    promise.resolve(AuthMapper.userToWritableMap(user))
                },
                onFailure = { error ->
                    promise.reject(ERR_GET_PROFILE, error.message, error)
                }
            )
        }
    }

    @ReactMethod
    fun getStoredSession(promise: Promise) {
        moduleScope.launch {
            try {
                val session = authRepository.getSession()
                if (session != null) {
                    promise.resolve(AuthMapper.sessionToWritableMap(session))
                } else {
                    promise.resolve(null)
                }
            } catch (e: Exception) {
                promise.reject(ERR_AUTH, e.message, e)
            }
        }
    }

    @ReactMethod
    fun logout(promise: Promise) {
        moduleScope.launch {
            try {
                authRepository.clearSession()
                emitUnauthorizedEvent()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(ERR_AUTH, e.message, e)
            }
        }
    }

    @ReactMethod
    fun hasToken(promise: Promise) {
        moduleScope.launch {
            try {
                val token = authRepository.getToken()
                promise.resolve(!token.isNullOrBlank())
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    /**
     * Emits `onUnauthorized` device event to React Native JS runtime.
     */
    private fun emitUnauthorizedEvent() {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onUnauthorized", Arguments.createMap())
        }
    }
}
