# Ordinary v2 shadow internal-release validation

The preview EAS profile is the selected internal-distribution target. It embeds `EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION=enabled`; development and production profiles remain disabled. Authority remains structurally `production_only` and cannot be enabled through this setting.

Preflight passed configuration, profile, authority, and secret-safe checks. No build was started because the EAS CLI is unavailable in the current environment. The required external step is to install/authenticate the established EAS CLI, then run exactly one preview internal build. No App Store submission or production promotion occurred, and no genuine real-user evidence exists until manual installation and event validation are completed.
