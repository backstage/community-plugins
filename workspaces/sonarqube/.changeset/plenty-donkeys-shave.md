---
'@backstage-community/plugin-sonarqube-backend': minor
'@backstage-community/plugin-sonarqube-react': minor
'@backstage-community/plugin-sonarqube': minor
---

Added the number of security hotspots and the technical debt to the SonarQube card. The card previously showed only the percentage of hotspots reviewed and the maintainability rating, so the underlying figures were not visible anywhere in Backstage. Instances that do not report these measures are unaffected. The technical debt is rendered as a work duration, so `sonarqube.technicalDebt.hoursInDay` was added to match the working day configured on the SonarQube instance, defaulting to 8 hours as SonarQube does.
