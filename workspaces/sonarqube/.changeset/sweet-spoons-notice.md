---
'@backstage-community/plugin-sonarqube-react': minor
'@backstage-community/plugin-sonarqube': minor
---

This feature is to provide tabular lists of sonarqube views at team, system and domain levels for each component part of that grouping. This tabular component uses existing sonarqube card component functionality to extract various subcomponents like as bugs, vulnerabilities, quality gates, and so on into their own components, allowing subcomponents to be used in multiple views. Iterating over the existing sonarQubeApi.GetFindingSummary is used to retrieve code quality metric insights data for all the components.

1. Refactored existing sonarqube card component to use multiple sub view components.
2. Added tabular component for displaying aggregated component metrics.
3. Api call to fetch aggregated component metrics results.
