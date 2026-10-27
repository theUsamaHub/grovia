# Dependency audit — 27 October 2026

`npm audit` reports three high-severity entries (zod, @expo/cli, expo) originating from a single transitive Zod advisory:
https://github.com/advisories/GHSA-mrhx-c7xc-m3w5

Expo CLI depends on Zod 3 (`^3.25.76`), which npm flags for memory exhaustion while validating oversized constrained collections. Grovia's direct Zod dependency is 4.6.7, outside the advisory range. The flagged copy is under Expo's CLI dependency tree; application feature validation is not implemented yet.

npm suggests downgrading Expo to 54.0.38. That is not a compatible fix for this SDK 58 project. No forced downgrade or cross-major dependency override has been applied. Recheck the upstream Expo CLI dependency and npm audit before release; this setup does not claim a clean security audit.
