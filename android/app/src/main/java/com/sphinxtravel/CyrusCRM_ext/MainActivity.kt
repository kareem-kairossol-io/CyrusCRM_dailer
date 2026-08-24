package com.sphinxtravel.CyrusCRM_ext

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.sphinxtravel.CyrusCRM_ext.work.CallRecordingWorkScheduler
import expo.modules.ReactActivityDelegateWrapper
import expo.modules.splashscreen.SplashScreenManager

class MainActivity : ReactActivity() {

  companion object {
    private const val PERMISSION_REQUEST_CODE = 101

    private val BASE_PERMISSIONS = listOf(
      Manifest.permission.READ_PHONE_STATE,
      Manifest.permission.READ_CALL_LOG,
      Manifest.permission.PROCESS_OUTGOING_CALLS,
      Manifest.permission.READ_CONTACTS
    )
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreenManager.registerOnActivity(this)
    // Pass null to super.onCreate to prevent react-native-screens Fragment restoration crash when returning from dialer/background
    super.onCreate(null)

    checkAndRequestPermissions()

    // Watch the system call log so a sync is triggered even if the
    // phone-state receiver misses an event.
    CallRecordingWorkScheduler.scheduleCallLogTrigger(this)
  }

  private fun checkAndRequestPermissions() {
      val permissions = BASE_PERMISSIONS.toMutableList().apply {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
              add(Manifest.permission.READ_MEDIA_AUDIO)
          } else {
              add(Manifest.permission.READ_EXTERNAL_STORAGE)
          }
      }

      val permissionsToRequest = permissions.filter {
          ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
      }

      if (permissionsToRequest.isNotEmpty()) {
          ActivityCompat.requestPermissions(
              this,
              permissionsToRequest.toTypedArray(),
              PERMISSION_REQUEST_CODE
          )
      }
  }

  override fun getMainComponentName(): String = "main"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
      this,
      BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      object : DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled
      ){}
    )
  }

  override fun invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        super.invokeDefaultOnBackPressed()
      }
      return
    }
    super.invokeDefaultOnBackPressed()
  }
}
