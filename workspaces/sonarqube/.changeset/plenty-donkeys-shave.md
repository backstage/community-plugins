---
'@backstage-community/plugin-sonarqube-backend': minor
'@backstage-community/plugin-sonarqube-react': minor
'@backstage-community/plugin-sonarqube': minor
---

Added the number of security hotspots and the technical debt to the SonarQube card. The card previously showed only the percentage of hotspots reviewed and the maintainability rating, so the underlying figures were not visible anywhere in Backstage. Instances that do not report these measures are unaffected.
