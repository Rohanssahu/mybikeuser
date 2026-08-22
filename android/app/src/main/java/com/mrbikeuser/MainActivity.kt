package com.mrbikedoctor.user

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "mrbikeuser"

  /**
   * Passing null instead of the saved instance state stops Android from restoring the
   * react-native-screens fragments after the activity is recreated (process death, "Don't keep
   * activities", or a configuration change that is not declared in AndroidManifest.xml).
   * Restored ScreenStackFragment/ScreenFragment instances would be created through their no-arg
   * constructor, which throws
   * "Screen fragments should never be restored" and crashes the app on relaunch.
   * See https://github.com/software-mansion/react-native-screens/issues/17
   * React Navigation rebuilds its own state from JavaScript, so navigation behaviour is unchanged.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
