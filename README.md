# Grovia

Focus. Grow. Thrive.

Offline-first Android and iOS productivity app built with Expo SDK 58, React Native and strict TypeScript. Includes a themed app shell, persistent Focus timers, Tasks, Insights, a garden world, breathing, ambience, categories and local backup controls. See [Focus and Tasks](docs/FOCUS_TASKS.md) for implemented behavior and remaining device validation.

See [release status](docs/RELEASE_STATUS.md) for implemented behavior, remaining product options and required device QA.

## Quick start

Use Node.js 24 LTS and npm (the lockfile is committed).

```powershell
cd 'E:\Mobile Apps\grovia'
npm ci
npm run web
```

Web is a convenient shell preview. SQLite, notifications, audio and background behavior require native device testing.

See [Android setup and troubleshooting](docs/ANDROID_SETUP.md) for the difference between Expo Go, a development build, and the local Android SDK. Run `npm run android:doctor` to check this PC before attempting a local build.

For mobile, install a development build on your device, then run:

```sh
npm start
```

The first Android development build requires Android Studio, an Android SDK/emulator or USB device, and a compatible JDK configured on your machine:

```sh
npm run android:build
```

Local iOS builds require macOS and Xcode (`npm run ios:build`). On Windows, use EAS cloud builds for iOS. The project is not linked to an Expo account yet. Before the first EAS build, choose the permanent Android package and iOS bundle identifiers, run `npx eas-cli@latest login` and `npx eas-cli@latest init`, then:

```sh
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

Physical iOS builds need Apple signing credentials. Build profiles are prepared; no cloud build or store submission has been started. Tree icons and splash artwork are configured.

## Commands

| Command                                             | Purpose                                          |
| --------------------------------------------------- | ------------------------------------------------ |
| `npm start`                                         | Metro for a development client                   |
| `npm run android` / `npm run ios`                   | Start Metro and open the installed mobile client |
| `npm run web`                                       | Browser preview                                  |
| `npm run android:build` / `npm run ios:build`       | Generate native project and build locally        |
| `npm run typecheck`                                 | Strict TypeScript validation                     |
| `npm run lint`                                      | Expo ESLint rules                                |
| `npm run format`                                    | Apply Prettier                                   |
| `npm run check`                                     | Typecheck, lint and formatting                   |
| `npm run doctor`                                    | Expo project diagnostics                         |
| `npm run deps:check`                                | Verify SDK-compatible dependencies               |
| `npx expo export --platform android --platform ios` | Verify production JS bundling for both platforms |

Use `npx expo install <package>` for additions, and commit changes to both package.json and package-lock.json. Use `npm ci` for reproducible installs. Never run an automated force-upgrade to address dependency warnings without checking SDK compatibility.

## Dependencies and scope

- Expo Router: routes in `src/app`; safe-area and gesture providers in the root layout.
- Zustand: future ephemeral UI state. SQLite: future durable records and preferences.
- Reanimated + Worklets and SVG: animations and lightweight charts.
- Expo Audio, Notifications and Haptics: device integrations for later features.
- File System, Sharing and Document Picker: future local import/export.
- date-fns: date handling. Zod: future backup and input validation.
- `@expo/vector-icons`: use Feather as the primary icon family.
- Outfit (400/500/600/700), DM Sans (400/500/600): locally bundled fonts; only required weights are imported.

AsyncStorage is deferred because SQLite will own preferences. React Hook Form is deferred until task forms justify it. Skia, full UI frameworks, backend/auth, telemetry, advertising and payments are excluded from phase 1.

Audio recording permissions and background audio services are disabled. Notification permissions are not requested at startup. No database schema or feature services are wired yet.

## Structure

```text
src/app/          Expo Router screens
src/components/   Shared and feature UI
src/features/     Domain logic and integrations
src/db/           Future migrations and repositories
src/stores/       Future ephemeral state
src/theme/        Proposed colors, typography, spacing
src/hooks/        Shared hooks
src/types/        Shared types
assets/           Production assets (currently empty)
docs/             Product context, reference art, setup decisions
```

Read [project context](docs/PROJECT_CONTEXT.md), [architecture notes](docs/ARCHITECTURE.md) and [asset ledger](docs/ASSETS.md) before feature work. The later approved Grovia identity in the context overrides its older working-name notes. The palette is provisional; the dark palette is a setup proposal.

## Branch workflow

`main` is the base branch. All implementation belongs on a short-lived branch such as `chore/project-setup` or `feat/focus-timer`, reviewed through a PR into `main`. The initial empty commit establishes a shared ancestry without app code on main. Do not commit or push implementation directly to main.

```sh
git switch main
git pull --ff-only origin main
git switch -c feat/your-feature
```

GitHub Actions checks pull requests and working branch pushes. Branch protection must be configured separately in GitHub; local conventions do not enforce it.

## Validation limits

Static checks and JS exports do not prove native compilation, startup, offline behavior, notification delivery, background reliability or installed size. Those require development/release builds and real-device QA in later phases.

## Phase 2: brand and appearance

The app now has an original tree icon, a themed appearance screen, System/Light/Dark switching and locally persisted preferences. Mobile uses SQLite with versioned transactional migrations; the browser preview uses localStorage. See [brand and storage details](docs/BRAND_THEME_STORAGE.md). Run `npm run test` for persistence, migration safety and theme-contrast tests. A native rebuild is required for the new launcher icon.

For the exported browser build, run npx expo export --platform web, then npm run preview (http://127.0.0.1:8082).
