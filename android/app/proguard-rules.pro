# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ---------------------------------------------------------------------------
# Google Play Services - Location
#
# Required. R8 full mode was shrinking away the abstract type
# com.google.android.gms.location.FusedLocationProviderClient while keeping
# the internal subclass (com.google.android.gms.internal.location.zzbi) and
# code whose method signatures still referenced the removed abstract type.
# Horizontal class merging then placed that dangling reference into a class
# instantiated from FragmentManager's constructor, so every AppCompatActivity
# construction (i.e. MainActivity) failed ART verification with
# java.lang.VerifyError on the very first launch of the release build.
# Keeping the public location API surface keeps the reference resolvable.
# ---------------------------------------------------------------------------
-keep class com.google.android.gms.location.** { *; }
-keep interface com.google.android.gms.location.** { *; }
-keep class com.google.android.gms.common.api.** { *; }
-dontwarn com.google.android.gms.**

# ---------------------------------------------------------------------------
# React Native core
# The react-android AAR ships most of its own consumer rules; these cover the
# reflection-based entry points that are not part of those consumer rules.
# ---------------------------------------------------------------------------
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keep,includedescriptorclasses class com.facebook.react.turbomodule.core.** { *; }
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.ReactPackage { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
    @com.facebook.react.bridge.ReactMethod <methods>;
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}
-keepclasseswithmembernames class * {
    native <methods>;
}
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *

# React Native feature flags.
#
# DefaultNewArchitectureEntryPoint.load() enables the New Architecture by installing a
# ReactNativeNewArchitectureFeatureFlagsDefaults override, and the C++ runtime reads those
# flags back through ReactNativeFeatureFlagsCxxInterop over JNI. R8 was removing the override
# class outright (it appeared in mapping.txt as R8$$REMOVED$$CLASS$$247), which leaves the
# native side of the New Architecture reading defaults instead of the app's real configuration.
# Keeping this package makes the flag values consistent between Kotlin, JS and C++.
-keep class com.facebook.react.internal.featureflags.** { *; }
-keep interface com.facebook.react.internal.featureflags.** { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }

# ---------------------------------------------------------------------------
# react-native-screens / React Navigation
# Screen fragments are instantiated by the library and looked up by the
# Android FragmentManager, so their types must survive shrinking.
# ---------------------------------------------------------------------------
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# ---------------------------------------------------------------------------
# react-native-push-notification (no consumer rules shipped)
# Components are resolved by name from AndroidManifest.xml.
# ---------------------------------------------------------------------------
-keep class com.dieam.reactnativepushnotification.** { *; }

# ---------------------------------------------------------------------------
# Firebase (messaging entry points are resolved reflectively)
# ---------------------------------------------------------------------------
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }
-dontwarn com.google.firebase.**

# ---------------------------------------------------------------------------
# Cashfree payment SDK (no consumer rules shipped; vendor-required keeps)
# ---------------------------------------------------------------------------
-keep class com.cashfree.pg.** { *; }
-dontwarn com.cashfree.pg.**

# ---------------------------------------------------------------------------
# Networking stack used by React Native
# ---------------------------------------------------------------------------
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# ---------------------------------------------------------------------------
# Keep source file / line numbers so Play Console stack traces stay readable
# after deobfuscation with mapping.txt.
# ---------------------------------------------------------------------------
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-renamesourcefileattribute SourceFile
