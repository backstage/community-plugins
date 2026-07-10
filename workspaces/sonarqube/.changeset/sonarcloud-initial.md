---
'@backstage-community/plugin-scaffolder-backend-module-sonarcloud': minor
---

New plugin: 5 scaffolder actions for SonarCloud project onboarding

- `sonarcloud:project:create` — Create project with Bearer auth and org support
- `sonarcloud:project:bind` — ALM binding (GitHub, GitLab, Bitbucket, Azure)
- `sonarcloud:defaultBranch:rename` — Rename default branch (defaults to `main`)
- `sonarcloud:qualityGate:assign` — Assign quality gate by name
- `sonarcloud:newCodeDefinition:set` — Configure new code period

Token and organization are sourced exclusively from `sonarqube.apiKey` and `sonarqube.organizationName` in app-config.
