# Focus & Productivity App — Master Project Context

> **Document status:** Product planning baseline, 27 October 2026  
> **Working name:** Focus App (final brand/name not selected). “Focusly” appeared in a sample UI concept and is **not** an approved name.  
> **Platforms:** Android and iOS  
> **Primary framework:** React Native + Expo + TypeScript  
> **Business model:** Free to use; no subscriptions or in-app purchases planned  
> **Target audience:** Ages **15–40+**, including students, developers, freelancers, professionals, and other people seeking better focus  
> **Product philosophy:** Offline-first, private by default, low friction, visually calming, rewarding without manipulative pressure.

## 1. Executive summary

Build a polished, lightweight focus and productivity application inspired by the broad category of Forest, without copying its branding, illustrations, screens, or proprietary mechanics. Combine customizable focus timers, linked tasks, clear analytics, gentle gamification through a virtual world, breathing and ambient sound tools, and eventually platform-permitted distraction management. Core features should work without an account or network connection. Keep all user-created data on-device in the first release.

**Key constraints:** Aim for **80–120 MB installed app size** on representative devices; this is a target, not a guarantee. Do not confuse APK/AAB download size with installed size. The first release should not require a backend, sign-in, or payments. App blocking is not guaranteed across both platforms and requires separate native feasibility review.


# Brand Identity & Typography

## 1. Official Application Identity

| Property | Details |
|---|---|
| **Application Name** | Grovia |
| **Official Tagline** | Focus. Grow. Thrive. |
| **Category** | Productivity & Focus |
| **Target Audience** | Ages 15–40+ |
| **Platforms** | Android & iOS |
| **Framework** | React Native + Expo |
| **Brand Personality** | Calm, modern, friendly, nature-inspired |
| **Visual Style** | Minimalist, organic, rounded, premium |
| **Brand Concept** | Transform productive habits into a growing virtual world |

### Brand Philosophy

Grovia is a free, offline-first productivity application designed to help users improve concentration, manage daily tasks, build consistent habits, and visualize their progress.

Every completed focus session contributes to the growth of the user's virtual world.

**Core Message:** Every minute of focus is a step toward growth.

---

## 2. Official Typography System

Grovia uses two complementary font families.

### Primary Font — Outfit

**Purpose:** Branding, headings, prominent statistics, and timer displays.

**Font Family:** Outfit  
**Source:** Google Fonts  
**License:** SIL Open Font License

Required weights:
- Outfit Regular — 400
- Outfit Medium — 500
- Outfit SemiBold — 600
- Outfit Bold — 700

### Secondary Font — DM Sans

**Purpose:** Body text, descriptions, navigation, buttons, forms, and settings.

**Font Family:** DM Sans  
**Source:** Google Fonts  
**License:** SIL Open Font License

Required weights:
- DM Sans Regular — 400
- DM Sans Medium — 500
- DM Sans SemiBold — 600

---

## 3. Typography Design Tokens

| UI Element | Font | Weight | Size |
|---|---|---|---|
| App Logo | Outfit | 700 | 32 |
| Page Heading | Outfit | 700 | 28 |
| Section Heading | Outfit | 600 | 22 |
| Card Heading | Outfit | 600 | 18 |
| Body Text | DM Sans | 400 | 16 |
| Secondary Text | DM Sans | 400 | 14 |
| Small Labels | DM Sans | 500 | 12 |
| Button Text | DM Sans | 600 | 16 |
| Timer Display | Outfit | 600 | 64 |
| Statistics Numbers | Outfit | 600 | 28 |
| Bottom Navigation | DM Sans | 500 | 12 |

All sizes represent React Native density-independent units.

Font scaling must respect accessibility settings.

---

## 4. React Native Font Installation

Install the required packages:

```bash
npx expo install expo-font @expo-google-fonts/outfit @expo-google-fonts/dm-sans
```

Import the fonts:

```tsx
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import {
  DM_Sans_400Regular,
  DM_Sans_500Medium,
  DM_Sans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
```

### Typography Configuration

```typescript
export const typography = {
  fonts: {
    heading: 'Outfit_700Bold',
    headingMedium: 'Outfit_600SemiBold',
    body: 'DM_Sans_400Regular',
    bodyMedium: 'DM_Sans_500Medium',
    bodyBold: 'DM_Sans_600SemiBold',
    timer: 'Outfit_600SemiBold',
  },

  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 64,
  },
};
```

Fonts must be loaded before rendering components that use them.

---

## 5. Branding Guidelines

### Logo

- Display the brand name as **Grovia**.
- Use Outfit Bold.
- Prefer a simple, recognizable symbol inspired by a growing plant, leaf, or floating island.
- Ensure the logo remains recognizable at small sizes.

### Visual Identity

- Nature-inspired colors.
- Rounded UI components.
- Soft shadows.
- Minimal visual clutter.
- Smooth, purposeful animations.
- Consistent spacing and typography.
- Accessible text contrast.

### Brand Colors — Proposed Palette

| Color | Hex | Purpose |
|---|---|---|
| Forest Green | `#2F6B4F` | Primary branding |
| Fresh Mint | `#A8D5BA` | Secondary accents |
| Warm Cream | `#F8F6EF` | Light backgrounds |
| Deep Charcoal | `#26332C` | Primary text |
| Soft Sage | `#DDEBDD` | Cards and surfaces |
| Golden Yellow | `#F4C95D` | Achievements and rewards |

These colors are initial design tokens and can be refined during UI design.

---

## 6. Brand Consistency Requirements

1. Use Outfit for headings, branding, timers, and major statistics.
2. Use DM Sans for descriptions, buttons, forms, and navigation.
3. Avoid introducing additional font families without design approval.
4. Maintain consistent font weights across screens.
5. Support dynamic font scaling and accessibility.
6. Optimize bundled font assets to maintain the application's 80–120 MB installed-size target.
7. Apply the same typography and visual identity across Android and iOS.

**Brand Status:** Approved  
**Application Name:** Grovia  
**Tagline:** Focus. Grow. Thrive.  
**Typography:** Outfit + DM Sans  
**Color Palette:** Proposed, pending final visual approval


## 2. Decisions, assumptions, and unresolved questions

### Confirmed direction
- Build one productivity app first, rather than multiple simultaneous products.
- Support Android and iOS with React Native, not Flutter.
- All features free; no paid tiers, in-app purchases, or subscriptions in the current plan.
- Offline-first; no mandatory account or cloud synchronization.
- Focus on high-quality UX, accessibility, low resource use, and a calming visual identity.
- Target broad age range **15–40+**. This is an audience hypothesis, not evidence of demand.
- Discuss detailed authentication/backend needs after features and feasibility are finalized.

### Proposed, not yet approved
- A floating-island/world-building reward mechanic; alternatives include a companion or journey map.
- Five main tabs: Focus, Tasks, World, Insights, You.
- Phase releases V1.0, V1.1, V2.0 as below.
- An internal development stack and suggested libraries; validate compatibility with the Expo SDK chosen at implementation time.

### Still to decide
- Final app/studio names and trademark/domain checks.
- First launch countries/languages, target personas and accessibility test group.
- Exact MVP scope, navigation flows, art direction, logo/icon, reward rules.
- Whether to ship breathing and virtual-world features in the first release.
- App blocking feasibility, permissions, platform entitlements, and fallback UX.
- Analytics/telemetry policy (local-only by default), crash reporting consent and privacy disclosure.
- Whether free means ad-free: **no purchases are planned, but advertising has not been explicitly approved or rejected**. Do not add ads without a product decision.
- Team members, delivery dates, budget, and QA ownership.

## 3. Target audience and user needs

**Primary age range: 15–40+**, spanning teenagers, university students, and adults over 40. The plus sign means there is no upper age cutoff. Age is not itself a reliable predictor of needs.

| Segment | Example problems | Product response |
|---|---|---|
| Students (roughly 15–24) | Distraction, exam prep, subject planning | Study timer, task linking, categories, session history |
| Developers/creators (roughly 18–40+) | Deep work, context switching, project milestones | Deep Work mode, task-linked sessions, interruption notes |
| Freelancers/professionals (roughly 20–40+) | Scheduling, competing priorities | Daily tasks, goals, flexible timers, trends |
| General adult users (including 40+) | Habit consistency, digital distractions, calm UX | Accessible controls, reminders, breathing, simple dashboards |

**Core jobs-to-be-done:** Start a focus session in seconds; see what to work on; know what was completed; understand patterns without guilt; optionally reduce distractions; enjoy earned visual progress. Avoid promising medical benefits or ADHD treatment.

## 4. Product principles and differentiation

1. **Fast start:** Start a focus session within a few taps, without onboarding friction.
2. **Useful beyond timing:** Connect sessions to tasks and goals.
3. **Private by default:** Keep task and focus data local; no account required.
4. **Meaningful gamification:** Reward consistency and completed goals; no punishment for rest days.
5. **Calm UI:** Legible, accessible, responsive; animation should never obstruct work.
6. **Reliable behavior:** Survive backgrounding, clock changes, and app restarts where feasible.
7. **Truly usable free experience:** No artificial feature locks.
8. **Platform honesty:** Clearly disclose limits of app blocking and background services.

## 5. Detailed functional requirements

### 5.1 Focus timer engine — V1.0, critical
- Pomodoro preset (25 minutes focus / 5 minutes break), editable by user.
- Deep Work preset (example 50/10), Quick Focus (10–15 minutes), Custom preset.
- Stopwatch/count-up mode with user-controlled stop.
- Start, pause, resume, end, restart; confirmation for destructive actions.
- Optional auto-start next focus/break, configurable cycles and long breaks.
- Visible remaining time, circular progress, current mode, linked task/category.
- Record actual focused duration and outcome (completed, stopped early, interrupted).
- Persist session state and timestamps; reconstruct elapsed time on resume/relaunch.
- Use wall-clock timestamps plus defensive handling of device clock changes; never rely on a constantly running JavaScript interval for background accuracy.
- Schedule local notifications for completion; permission request only when needed.
- Define behavior for paused sessions, system reboot, daylight-saving changes, and app force-stop during QA.

**Acceptance criteria:** User can start an offline session, background the app, reopen it, and see accurate reconstructed status; session completion is recorded once, not duplicated.

### 5.2 Tasks and planning — V1.0
- Create, edit, delete, and complete tasks.
- Title required; optional description, category, priority, estimate, due date.
- Today / Upcoming / Completed views; clear empty states.
- Associate focus sessions with tasks; show accumulated focus time per task.
- Daily goals such as total minutes or completed sessions.
- Later: subtasks, recurring tasks, richer calendar views.

**Acceptance criteria:** Task-linked session updates task statistics correctly; task deletion does not corrupt historical focus records.

### 5.3 Categories and session history — V1.0
- Built-in editable examples: Study, Coding, Reading, Work, Personal.
- Create/rename/archive categories; assign color/icon.
- Session history shows date, duration, mode, linked task, category, status, optional notes.
- Filter by time range and category; support correction/deletion of mistaken entries with clear confirmation.

### 5.4 Analytics and insights
**V1.0:** Today/weekly total focus minutes, completed sessions, completion rate, focus by category, recent sessions, daily goal progress.

**V1.1:** Monthly/yearly charts, calendar heatmap, most active hours, personal bests, comparison with previous week, weekly summary, exportable summary.

Analytics describe *recorded activity*, not cognitive performance. Use honest labels and handle sparse/empty data gracefully. Compute aggregates locally from SQLite; cache only when necessary.

### 5.5 Gamified virtual world
**Proposed direction:** A lightweight **2D floating island** or garden that develops through focus achievements. The earlier generated visual is **inspiration only**, not final approved art.

**V1.0 minimal concept (subject to approval):** One island background; a small collection of tree/flower assets; earn visual unlocks for completed sessions and sustainable daily goals; a simple inventory/place/remove flow; no purchases.

**V1.1:** More trees, houses, decorations, themes, optional companion, progress milestones.

**Later:** More environments and personalization only if user feedback justifies them.

**Design rules:** Do not penalize users by destroying earned items for interrupted sessions. Avoid rewards that encourage skipping breaks or excessively long work periods. Keep world animation optional/reduced-motion friendly. Reuse layered WebP/PNG/SVG assets rather than hundreds of full-screen renders.

### 5.6 Goals, streaks, achievements
- Configurable daily focus-minute or session goals.
- Non-punitive streaks based on meeting goals; consider rest-day allowances.
- Achievement examples: first session, 10 sessions, seven goal days, 60-minute session, 100 total hours.
- Achievements remain unlocked after missed days; no paid currency.
- Reward state stored locally, with idempotent unlock logic.

### 5.7 Breathing and relaxation
- Simple animated guided breathing screen with inhale/exhale prompts.
- Optional box-breathing 4–4–4–4 and configurable intervals.
- 1–5 minute relaxation presets, with pause/stop and reduced-motion alternatives.
- Clear wellness positioning; **not** a medical treatment for ADHD, anxiety, or any condition.

### 5.8 Sound effects and ambience
**UI sounds:** focus start, completion, break start, task completed, reward unlocked, planting/placing item, subtle optional tap sound.

**Ambient options:** Rain, forest, ocean, wind/fireplace; start with 3–4 loops. Independent volume controls, master volume, looping, mute, and interruption handling. Respect silent-mode/background-playback choices.

**Creation pipeline:** Use Audacity for recording/editing, Bfxr for simple generated effects, LMMS for short melodic cues. Freesound is optional only after checking each asset's license and attribution requirements. Prefer original or properly licensed audio; maintain an asset/license ledger.

**Formats:** AAC/M4A or MP3 for broad mobile compatibility; compressed, loopable files. Aim for short UI cues of tens of KB and ambient loops roughly 0.5–3 MB each, depending on duration/bitrate. Background audio must be tested with real devices and configured natively.

### 5.9 Distraction management and app blocking
**V1.0:** Distraction-minimal focus UI, optional interruption notes, confirmation before abandoning a session.

**Future feasibility study:** Scheduled blocking and selected-app lists. iOS may require Family Controls/Managed Settings/Device Activity entitlements and user authorization; Android implementations vary with available APIs, usage access, accessibility restrictions, and Play policies. Do not promise universal or unbypassable blocking. Design a useful fallback for unsupported devices.

### 5.10 Personalization and accessibility
- Light/dark mode, accessible colors, adjustable typography, custom timer backgrounds.
- Haptic feedback and sound toggles; user-defined focus/break intervals.
- Screen-reader labels, large tap targets, dynamic type, high contrast, reduced motion.
- Local notifications and reminder schedules with user control.
- Explain local-only storage and offer export/import in V1.0 if feasible.

### 5.11 Local data portability
- Export structured JSON (with schema version) for sessions, tasks, preferences, world items, and achievements.
- Import with validation, preview, duplicate handling, and rollback on failure.
- Use platform file picker/share sheet; clearly warn that uninstalling or losing a phone can lose local data.
- Avoid claiming automatic cloud backup when none exists.

### 5.12 Explicitly out of scope initially
- Mandatory sign-up/login, hosted API, cross-device sync, social feeds, public leaderboards, multiplayer, subscription billing, AI coaching, invasive monitoring, and complex 3D worlds.
- **Invoice generation is not part of this focus-productivity app**; the earlier mention of an invoice appears to be a separate idea and is not included without an explicit scope decision.

## 6. Navigation and example screens

**Proposed bottom tabs:** `Focus | Tasks | World | Insights | You`.

1. **Onboarding:** Brief value proposition, optional mode selection, privacy explanation; skip allowed; notifications requested contextually.
2. **Focus home:** Timer ring, mode chips, linked task/category, start button, today's goal, compact world preview.
3. **Active session:** Large timer, pause/end, subtle ambient controls, progress illustration; minimal distractions.
4. **Tasks:** Today/Upcoming/Completed segments, add task, quick start focus on a task.
5. **Task editor:** Title, notes, category, priority, estimate, due date; save/cancel.
6. **World:** Interactive island preview, unlocked item collection, place/decorate actions, progress.
7. **Insights:** Day/Week/Month views, charts, category distribution, heatmap (later), session list.
8. **Breathe:** Animated pacing guide, pattern selector, duration, start/stop.
9. **Sounds:** Ambient sound mixer with individual sliders and master controls.
10. **You/Settings:** Themes, accessibility, reminders, backup/export/import, privacy details.
11. **App blocking (future):** Permission education, selected apps, schedule, unsupported-state messaging.

### Visual language
- Calming nature-inspired aesthetic: cream backgrounds, mint/forest green accents, occasional blue/amber highlights.
- Soft rounded cards, strong hierarchy, high-contrast readable text, restrained gradients.
- Simple line icons for timer, check-square, globe/island, bar chart, profile, bell, sound, moon/sun, leaf, trophy.
- Illustrated 2D world as optional delight; main workflow remains fast and clear.
- Avoid copying Forest's trees, wording, visual assets, onboarding layouts, or exact iconography.

## 7. Technology and library plan

| Layer | Proposed choice | Notes |
|---|---|---|
| Framework | React Native + Expo | Android/iOS, use compatible current Expo SDK |
| Language | TypeScript | Strict mode |
| Routing | `expo-router` | May come preinstalled in template |
| State | `zustand` | Ephemeral timer/UI state, not sole persistence |
| Database | `expo-sqlite` | Local sessions/tasks/goals/world records |
| Small preferences | `@react-native-async-storage/async-storage` | Optional; avoid duplicating SQLite state |
| Animation | `react-native-reanimated` | Timer ring, UI transitions, breathing |
| Gestures | `react-native-gesture-handler` | World placement, touch controls |
| Vector graphics/charts | `react-native-svg` | Custom charts without heavy chart framework |
| Advanced 2D | `@shopify/react-native-skia` | **Deferred** pending prototype/size benchmarks |
| Icons | `@expo/vector-icons` or Lucide | Choose one main icon family |
| Audio | `expo-audio` | UI effects, looping ambience |
| Notifications | `expo-notifications` | Local reminders and timer completion |
| Haptics | `expo-haptics` | Optional, user controlled |
| File import/export | `expo-file-system`, `expo-sharing` | May also need document picker for import |
| Dates | `date-fns` | Local time formatting and aggregation |
| Forms/validation | `react-hook-form`, `zod` | Add only where justified |

**Dependency rule:** Prefer custom reusable components over installing multiple full UI frameworks. Use `npx expo install` for Expo/native packages to obtain compatible versions; verify dependencies already provided by the starter template.

## 8. Proposed app architecture

```text
src/
  app/                   # Expo Router routes
  components/
    ui/                  # Button, Card, Modal, ProgressRing, Toggle
    focus/               # TimerView, FocusModePicker
    tasks/               # TaskRow, TaskEditor
    world/               # IslandScene, Inventory, RewardBadge
    analytics/           # FocusChart, StatsCard, Heatmap
    wellness/            # BreathingGuide, SoundMixer
  features/
    focus/               # Timer domain logic and persistence
    tasks/               # Task CRUD and linking
    goals/               # Daily goals and streak rules
    world/               # Progression and unlock engine
    analytics/           # Aggregation services
    audio/               # Playback manager
    notifications/       # Scheduling and permissions
    backup/              # Import/export, schema validation
  db/                    # SQLite migrations, repositories
  stores/                # Zustand stores
  hooks/
  theme/                 # Colors, spacing, typography
  types/
assets/
  images/                # Optimized static art
  world/                 # Reusable layered sprites
  sounds/                # Compressed SFX and ambience
  fonts/                 # Minimal licensed font assets
```

### Local database sketch
- `focus_sessions(id, mode, task_id?, category_id?, started_at, ended_at?, planned_seconds, actual_seconds, status, notes?)`
- `tasks(id, title, description?, category_id?, priority?, estimated_minutes?, due_at?, completed_at?, created_at, updated_at)`
- `categories(id, name, color, icon, archived_at?)`
- `daily_goals(id, target_type, target_value, effective_from, active)`
- `achievements(id, code, unlocked_at, metadata_json?)`
- `world_items(id, item_type, unlocked_at, placed_at?, x?, y?, variant?)`
- `app_settings(key, value_json)`
- `schema_migrations(version, applied_at)`

Define foreign keys, indices, migration versioning, deletion policies, and import/export schema before implementation. Store timestamps consistently (UTC) and render local dates in the UI.

## 9. Backend and authentication decision framework

**Current default: no backend and no login.** Timer, tasks, local analytics, rewards, sounds, and breathing do not inherently require server infrastructure.

A backend becomes relevant for account-based cloud backup, device synchronization, community challenges, shared tasks, or online leaderboards. If those features are approved later, assess API/auth choices separately (Node.js or .NET are both feasible) and ensure optional account creation does not block core offline usage.

A local-first design is not a promise of zero network calls: optional telemetry, crash reports, and store services must be evaluated and disclosed separately.

## 10. Performance, package size, and battery targets

- **Size goal:** 80–120 MB **installed** on representative Android/iOS devices; measure per platform and architecture. Treat this as a target, not a fixed prediction.
- Prefer WebP for suitable illustrations, SVG for icons, compressed AAC/M4A/MP3 for audio.
- Use layered, reusable 2D world assets rather than pre-rendered video/large sprite sheets.
- Avoid bundling many large fonts, full-screen videos, unnecessary SDKs, or duplicate icon packs.
- Delay Skia until profiling proves its value.
- Lazy-load nonessential screens/assets; test startup time, animation smoothness, RAM and battery use.
- Test release builds on low/mid-range Android phones and at least one real iPhone.
- Track download size, installed size, asset size, and performance in CI/release checklist.

**Illustrative size allowance (not an estimate):** native/runtime 35–55 MB, JS 3–8 MB, visuals 15–32 MB, audio 3–8 MB, other native assets 5–12 MB. These numbers are not reliably additive across platforms and must be replaced by actual measurements.

## 11. Delivery plan

### V1.0 — Usable offline core
- Timer presets, stopwatch, persistent sessions, local notifications.
- Tasks, categories, linked sessions, basic goals.
- Session history, basic insights.
- Minimal virtual-world progression **if prototype passes UX/performance review**.
- Basic breathing screen **if scope permits**.
- Preferences, accessibility baseline, data export/import where feasible.
- No account or backend.

### V1.1 — Depth and polish
- Analytics heatmap, personal bests, weekly summary.
- Ambient sound mixer and richer soundscapes.
- Achievements and expanded world items.
- Recurring tasks/subtasks if user feedback supports them.
- More themes and customization.

### V2.0 — Conditional advanced features
- Native app-blocking functionality only after feasibility, policy and entitlement checks.
- Optional cloud backup/login only if a strong user need is validated.
- Further world expansion based on retention and performance.

### Development milestones
1. Validate target users and user journeys; prioritize features.
2. Create UX flows, wireframes, design tokens, icons, and original illustration style.
3. Build timer persistence prototype and world rendering/size prototype.
4. Implement SQLite repositories and domain logic.
5. Build screens and accessible interactions.
6. Add sounds, notifications, data portability.
7. QA background behavior, data integrity, offline use, permissions, battery, and size.
8. Produce store screenshots, privacy policy, disclosures, and publish-ready builds.
9. Launch, observe feedback, and iterate; marketing strategy to be decided separately.

## 12. Suggested team responsibilities (roles, not assigned people)

| Role | Scope |
|---|---|
| Product owner | Scope, prioritization, acceptance criteria, release decisions |
| React Native engineer | UI, navigation, state, device integrations |
| UX/UI designer | User flows, components, icon system, accessibility |
| Illustrator/motion designer | World art, animation assets, visual identity |
| QA engineer | Device matrix, regression, edge cases, store readiness |
| Audio creator (part-time) | Sound design, compression, licenses |
| Backend engineer | **Not required for initial release** |

One contributor may hold several roles. Do not assume headcount or budget before assignment.

## 13. Quality assurance checklist

- Timers work across app background/foreground, force-close/reopen, low battery, and notifications disabled.
- No duplicate session completion, achievements, or notification events.
- SQLite migrations and export/import preserve data integrity.
- Offline functionality works in airplane mode.
- Animations honor reduced-motion settings; readable text and screen-reader labels.
- Sound respects mute/volume choices and handles interruptions/headphones.
- No excessive battery drain during idle or active sessions.
- Installed size within target or documented exception.
- No unsupported claims about app blocking or health outcomes.
- No third-party artwork/audio used without appropriate rights.
- Privacy policy accurately reflects storage, permissions, SDKs, and data collection.

## 14. Success criteria and research questions

**Product validation:** Can new users start a session easily? Do they link sessions to tasks? Do they return voluntarily? Are analytics understandable? Is the virtual world enjoyable without distraction? Do users trust the offline/local-data model?

**Metrics (to define baselines after testing):** successful first-session rate, task-linked session rate, completion rate, repeat use, user-reported usefulness, crash-free sessions, app launch time, installed size, and battery impact. If no analytics SDK is used, gather opt-in tester feedback or local diagnostics instead of silently transmitting data.

## 15. Legal, privacy, and store considerations

- App store listings must accurately describe functionality and data practices.
- Because users may be 15–17, review age-appropriate design, permissions, advertising decisions, and relevant child/teen policies before release.
- Publish an accessible privacy policy URL even for local-only apps when required by the store.
- No account does not remove the need to consider platform permissions and third-party SDK behavior.
- Original brand, icons, world art, and sounds; do not imitate Forest's protected assets.
- Confirm Apple developer enrollment, Google Play developer requirements, and current review policies at release time.

## 16. Immediate next decisions

1. Approve the **minimum launch feature set**, especially world and breathing scope.
2. Select the **original gamification mechanic** and visual direction.
3. Approve **ad-free vs ad-supported** (both can be free to download).
4. Finalize product name, brand palette, icon system, and first-screen wireframes.
5. Run technical prototypes for timer persistence, sound playback, and installed size.
6. Assign owners and define the implementation plan.

---

**Context preservation note:** This document distinguishes agreed product constraints from recommendations and open decisions. It is the planning source of truth until a newer approved version replaces it.
