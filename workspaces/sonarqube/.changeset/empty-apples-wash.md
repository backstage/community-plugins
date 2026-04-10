---
'@backstage-community/plugin-sonarqube-backend': patch
---

Added actions for SonarQube code quality data.

Registered two actions that expose SonarQube backend capabilities via MCP and scaffolder templates:

- `sonarqube:get-findings` — return all SonarQube measures (bugs, coverage, code smells, etc.) for a catalog entity
- `sonarqube:get-quality-gate` — return the quality gate status and key metrics summary for a catalog entity
