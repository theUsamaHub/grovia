# Running Grovia on Android

Web runs JavaScript in a browser. Android additionally needs a compatible native runtime; web success alone does not verify SQLite, notifications, native libraries, or device permissions.

## Choose the correct command

- `npm start`: starts Metro for an installed Grovia development build; scan its QR code from the development client. This does not require a local Android SDK.
- `npm run start:go`: explicitly starts Metro for Expo Go. The installed Expo Go must support SDK 58. This is a limited preview, not validation of the custom native app, splash screen, or all native behavior.
- `npm run android`: uses the local Android SDK's adb to open an already installed Grovia development build on a connected device or emulator. It does not install the SDK or compile the application.
- `npm run android:build`: generates and builds the native Android project locally; requires the Android SDK and a compatible JDK.
- `npm run android:doctor`: checks SDK/platform-tools, Java on PATH, and connected devices, without changing machine settings.

## Local build prerequisites

Install Android Studio, then use SDK Manager to install the Android SDK platform/build tools required by the generated Expo Android project, Android SDK Platform-Tools, and an emulator/system image if using an emulator. Configure ANDROID_HOME to the actual SDK directory and add its platform-tools directory to PATH. Configure the required JDK with JAVA_HOME and PATH. Open a new terminal after changing environment variables.

Use Android Studio Device Manager to create/start an emulator, or connect a physical device with USB debugging and authorize the computer on the device. Run `npm run android:doctor` again before `npm run android:build`.

## Cloud alternative

The Android application ID is configured as `com.theusamahub.grovia`. The preview profile explicitly produces an installable APK with the JavaScript bundled, so it runs without Metro or your computer.

From the project directory:

```powershell
npx eas-cli@latest login
npm run android:apk
```

On the first build, follow the prompts to create/link the project under your Expo account and generate an Android signing keystore. When the build finishes, open the download link on your phone, download the APK and allow installation from that browser when Android asks. This is a test build, not a Play Store upload. EAS builds in the cloud without a local Android SDK or JDK.

For development with Metro instead, run `npx eas-cli@latest build --platform android --profile development`, install that APK, then run `npm start`. The development APK is different from the standalone preview APK.

`npm run android` opens an already installed development client; it does not create an APK. Restart Metro after changing app configuration.

Source: [Expo APK builds](https://docs.expo.dev/build-reference/apk/).

## Diagnose a phone error

Keep the exact first error and say whether it appears in Expo Go, a Grovia development build, or the terminal. SDK mismatch, missing native modules, a development-client URL opened in Expo Go, a network connection problem, and an application exception require different fixes. Do not delete application data to troubleshoot a timer: it contains local session history.

After a dependency update, stop Metro and restart it with `npm start -- --clear` (development build), or `npm run start:go -- --clear` (Expo Go). Native dependency changes require rebuilding an existing development client.

Sources: [Expo environment setup](https://docs.expo.dev/get-started/set-up-your-environment/), [development builds](https://docs.expo.dev/develop/development-builds/introduction/).
