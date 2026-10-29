# Grovia implementation and release status

## Implemented

- Offline Focus timers and task planning, described in FOCUS_TASKS.md. Optional automatic routines support 1–8 cycles and 1–60 minute long breaks; transitions run only while open and timely. Late returns and cold launches wait for the user. Stopwatch remains manual.
- Insights: local-day 1/7/30-day charts, total minutes, completed sessions and completion rate, category breakdown/filter, paginated history, notes/category/duration correction and confirmed deletion. Breaks excluded; activity is assigned to the local day on which a session ended.
- World: nine editable garden plots, three original plant illustrations, unlocks at 1/5/10 completed focus sessions, permanent milestone achievements. No destructive penalties. Native unlock persistence is atomic with session completion. Browser history remains authoritative and the garden reconciles unlocks on open.
- Categories: built-in examples, create/rename/archive/restore, color/icon choices, focus/task pickers, historical label snapshots.
- You: appearance, category management, guided 1/3/5-minute easy or box breathing with pause/reset, three original ambient textures with volume/mute, JSON backup export/import.
- First-run skippable onboarding, shared page fades, timer progress ring, reduced-motion handling.
- SQLite migration 4 retains old settings/session records and adds category/notes columns.

## Additional completed modules

- Goals can use recorded minutes or completed focus sessions. Weekly rest days preserve streaks without adding unearned goal days. Goal changes apply from today, with previous targets retained. Tracking begins with the first saved goal.
- Insights includes adjacent seven-day comparisons, a 365-day chart grouped by calendar month, a 91-day activity heatmap, best recorded day and most active session-finishing hour. Weekly summaries export as text. These views use all categories; the existing journal filter applies to the journal and its chart.
- Native weekly reminders support selected weekdays and a 24-hour time, with contextual permission requests and cancellation. Browser UI explains native-only availability. Reminder identifiers are separate from timer completion notifications. Saving attempts to restore the previous schedule if scheduling or persistence fails; an interrupted save can require opening settings and saving again. Device delivery, time-zone changes, reboot and force-stop still require native QA.
- Ambience supports three simultaneous foreground layers, per-layer levels, master volume, mute, pause-all and saved mixes. Playback is never automatically restored. Changes to layer selection take effect on the next playback start; deselection pauses that layer immediately.
- Settings tools use full-width cards outside the branding hero.

## Backup behavior

Versioned JSON exports completed/stopped session history, tasks, categories, world state and appearance, plus optional goal history, routine and ambience settings. Settings are restored only if absent on the receiving device; existing preferences win. Reminder schedules are device-specific and excluded. Reopen the app after importing preferences. Active timers are deliberately excluded. Preview precedes import. Import merges new IDs, preserves existing entries with matching IDs, and keeps the current layout, appearance and goal. Earned items are unioned. Native import rolls back as one SQLite transaction. Browser import uses a local rollback journal recovered during startup if interrupted. Files are bounded to 10 MB and validated before writes. Backups are unencrypted files; store them privately.

## Required before release

This is an implementation build, not a store-ready or device-certified release. Browser automation timed out in this environment; visual and interaction QA has not been completed for these new pages.

1. Install/configure Android SDK and Java; create a native development build. Choose permanent Android/iOS identifiers before store distribution and link the project to the user's Expo account if using EAS.
2. On real Android/iOS devices check cold start, first-run onboarding, both themes, large text and screen reader, keyboard/form scrolling, task CRUD and linked timer history, timer pause/background/relaunch/reboot/force-stop, notifications and denied permissions, garden placement, history corrections, and file picker/share/backup round trip.
3. Test audio in silent mode, during interruptions, app background/foreground, track changes, and Bluetooth/headphones. Test breathing pause/resume and reduced-motion settings.
4. Check installed size and performance on representative devices. No APK/IPA size or runtime performance claim has been measured yet.

## Explicit remaining product options

Optional haptic/UI-sound cues, custom timer backgrounds and additional configurable breathing intervals remain personalization work. Richer world art, recurring tasks/subtasks, calendar navigation and previous-year comparisons remain later enhancements. Native app blocking requires platform feasibility and entitlement work; cloud/social features require a separate product decision. Real-device QA and release configuration remain required; successful bundles do not certify device behavior.
