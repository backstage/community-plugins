---
'@backstage-community/plugin-sonarqube-backend': minor
---

**BREAKING** Added error logging when API calls fail. With this change your will need to include the `logger` when using the `DefaultSonarqubeInfoProvider.fromConfig()` like this: `DefaultSonarqubeInfoProvider.fromConfig(config, logger)`
