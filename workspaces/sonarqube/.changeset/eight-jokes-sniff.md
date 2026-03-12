---
'@backstage-community/plugin-sonarqube-react': major
'@backstage-community/plugin-sonarqube': major
'@backstage-community/plugin-sonarqube-backend': minor
---

A new `GET /entities/:kind/:namespace/:name/summary` endpoint has been introduced, which resolves the entity, reads the `sonarqube.org/project-key` annotation, and fetches findings and instance URL server-side. This replaces the old `/findings` and `/instanceUrl` endpoints (now deprecated), removing the need for the frontend to parse annotations or pass project keys directly.

**BREAKING**: The `SonarQubeApi` interface has been consolidated from two methods (`getFindingSummary` and `getFindingSummaries`) into a single `getSummaries` method that accepts an array of `Entity` objects (instead of `componentKey`/`projectInstance` options).

The `<SonarQubeCard />` component now displays more specific error messages.
