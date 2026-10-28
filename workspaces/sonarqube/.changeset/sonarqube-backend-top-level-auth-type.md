---
'@backstage-community/plugin-sonarqube-backend': patch
---

Added the top level `sonarqube.authType` option to the config schema. The plugin already read it, but tools that build their settings from the schema could not set it, so single instance setups against SonarQube Cloud fell back to `Basic` auth. The `authType` of each instance is no longer sent to the frontend, which never used it.
