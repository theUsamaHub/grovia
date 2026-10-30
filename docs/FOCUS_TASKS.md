# Focus and Tasks modules

Implemented together on the feature branch: themed splash and five-tab shell, Focus timer, Tasks planner, and existing appearance settings. World and Insights are now implemented; see RELEASE_STATUS.md for the full application scope and remaining release checks.

Focus supports 25/5 Pomodoro, 50/10 deep focus, 10/2 quick focus, custom 1–180 minute focus and 1–60 minute breaks, and a stopwatch capped at 24 hours. Start, pause, resume, finish, restart, and manual breaks persist locally. Elapsed time is computed from saved timestamps, including after background/relaunch. Device clock changes affect this calculation. Completion writes session history and clears active state atomically. Native local notifications are optional and delivery depends on OS permissions and scheduling.

Tasks supports create/edit/delete, complete/reopen, optional description/category/priority/estimate/due date, and Today/Upcoming/Completed views. Today includes undated and overdue tasks. Focus starts from a task with a 25-minute session. Only one timer can run. Task identity and title are snapshotted in sessions; deleting a task leaves its historical sessions intact. Accumulated task time uses all saved focus records, not only the recent-history list. Breaks are excluded. Daily goals use focus minutes from sessions finished on the current local calendar day.

Native storage uses SQLite migrations through version 4. Planner data is stored as an app setting; session records have optional indexed task identifiers. The web preview uses localStorage. Reduced-motion preferences disable the timer animation and planner fades. Save errors retain the previous persisted data and show retryable feedback.

Validation: automated timer, filtering, input validation, SQLite migration/rollback/idempotency, task history retention, and theme contrast checks. Native device testing remains required for keyboard behavior, font scaling, background restoration and notification delivery. No APK has been compiled on this PC yet because the Android SDK and Java setup are pending.

Daily goals now support minutes or completed sessions in Tasks, with weekly rest days and dated goal policies. Details are in RELEASE_STATUS.md.
