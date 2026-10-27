# Brand, theme and local storage

Grovia uses a mint tree, cream trunk and golden seed on forest green: steady attention becoming growth. The icon is original AI-generated artwork, created with the built-in imagegen tool. Production files are 1024 × 1024 PNGs. The main icon is opaque; the adaptive foreground preserves transparency and has extra safe-area padding. Rebuild the native app to see launcher changes. No Android monochrome variant is supplied yet.

## Theme system

`src/theme/index.ts` is the source for semantic colors, spacing, radii and typography. Use `useAppTheme()` and shared `AppText`, `Card`, and `AppButton` primitives in future screens. Avoid hard-coded screen colors. Outfit supplies headings; DM Sans supplies body and controls. Text scaling stays enabled.

Appearance offers System (default), Light and Dark. System follows live OS changes. Explicit choices override it. Preferences load before routed screens appear and save before selection is confirmed. Writes are serialized by disabling controls while saving; failures keep the previous selection and show an error. Database startup failures offer retry, never delete user data.

| Role           | Light   | Dark    |
| -------------- | ------- | ------- |
| Background     | #F8F6EF | #17251D |
| Surface        | #FFFFFF | #21352A |
| Muted surface  | #EAF0E6 | #2B4233 |
| Main text      | #26332C | #F8F6EF |
| Secondary text | #58675C | #B8C9BA |
| Primary        | #2F6B4F | #A8D5BA |
| On primary     | #FFFFFF | #17251D |
| Reward         | #F4C95D | #F4C95D |

Controls use 52px minimum button height, selected-state icons, radio semantics and visible keyboard focus. Contrast tests enforce 4.5:1 for text/primary/error on all main surfaces. Gold is an accent, not general body text. Shadows and animation are intentionally restrained.

## Native SQLite

Android and iOS open `grovia.db` in Expo SQLite's default private application directory. Initialization enables WAL, foreign keys and a busy timeout. An exclusive transaction applies ordered migrations and `PRAGMA user_version` atomically. Future schema versions fail safely instead of silently downgrading. Failed initialization closes the connection and permits retry.

Migration 1 creates `app_settings(key PRIMARY KEY, value_json CHECK(json_valid), updated_at)`. Values use parameterized upserts and UTC ISO timestamps. Theme is stored under `appearance`. Invalid preference values fall back to System. Task/session/world tables will be added through migrations when those domain features are implemented; they are not fabricated in this phase.

The browser is a UI preview and uses localStorage through the `.web.ts` adapter. It does not test native SQLite. Clearing browser data resets preview appearance. On mobile, uninstalling the app may delete its database. No cloud sync, encryption claim or automatic backup is introduced.

## Verification

`npm run test` uses Node's real SQLite engine to check migration idempotence, disk persistence after reopen, parameterized writes, rollback and future-version rejection. It also checks theme resolution and contrast. Expo's native bridge and installed launcher masks still require Android/iOS device testing.

## Generation prompts

Main icon: a single opaque square mobile icon for Grovia, a calm offline focus app; distinctive sculpted forest tree with three softly rounded mint leafy boughs, cream branching trunk and tiny golden seed; deep forest background; crisp organic geometry with restrained dimensional shading; centered, readable at small sizes; no lettering, border, outer rounded corners, scenery or copied Forest branding.

Adaptive edit: preserve the generated tree shape, shading and colors; remove the green background to real transparency; center with generous transparent padding for launcher masks; no additional artwork. Generated images were then resized and padded for platform asset dimensions without changing the design.
