---
'@backstage-community/plugin-sonarqube-backend': minor
'@backstage-community/plugin-sonarqube-react': minor
'@backstage-community/plugin-sonarqube': minor
---

Added the number of security hotspots and the technical debt to the SonarQube card. The card previously showed only the percentage of hotspots reviewed and the maintainability rating, so the underlying figures were not visible anywhere in Backstage. Instances that do not report these measures are unaffected. The technical debt is rendered as a work duration, so `sonarqube.technicalDebt.hoursInDay` was added to match the working day configured on the SonarQube instance, defaulting to 8 hours as SonarQube does. Each entry of `sonarqube.instances` can set its own `technicalDebt.hoursInDay`, which takes precedence for the projects annotated with that instance.

The keys of the public `Metrics` type are now optional. They were required, so every added metric key broke the consumers building a `FindingSummary`, which is what made adding `security_hotspots` and `sqale_index` a breaking change rather than an additive one.
