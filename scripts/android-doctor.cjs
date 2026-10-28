const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const candidates = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
].filter(Boolean);
const sdk = candidates.find((p) =>
  fs.existsSync(
    path.join(
      p,
      'platform-tools',
      process.platform === 'win32' ? 'adb.exe' : 'adb',
    ),
  ),
);
const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
console.log(
  sdk
    ? 'Android SDK: ' + sdk
    : 'Android SDK/platform-tools: missing. Install Android Studio and use SDK Manager to install the SDK and platform-tools.',
);
console.log(
  java.status === 0
    ? 'Java: available'
    : 'Java: unavailable on PATH. Configure the JDK required by your Android build.',
);
if (sdk) {
  const adb = spawnSync(
    path.join(
      sdk,
      'platform-tools',
      process.platform === 'win32' ? 'adb.exe' : 'adb',
    ),
    ['devices'],
    { encoding: 'utf8' },
  );
  console.log(adb.stdout || adb.stderr || 'Could not query devices.');
}
console.log(
  'npm run android launches an already installed development build through adb.',
);
console.log(
  'npm run android:build compiles locally and requires the SDK and JDK.',
);
console.log(
  'For a phone with an installed development build, npm start provides a QR code without requiring a local SDK.',
);
console.log(
  'Expo Go is a different runtime: use npm run start:go only with a compatible Expo Go version.',
);
if (!sdk || java.status !== 0) process.exitCode = 1;
