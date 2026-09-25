---
'@backstage-community/plugin-sonarqube-backend': minor
'@backstage-community/plugin-sonarqube-react': minor
'@backstage-community/plugin-sonarqube': minor
---

The SonarQube card now displays the number of security hotspots and the technical debt alongside the existing hotspot review percentage and code smell information.

Technical debt is formatted as a work duration. The working day length can be configured globally with `sonarqube.technicalDebt.hoursInDay` and overridden per SonarQube instance using `sonarqube.instances[].technicalDebt.hoursInDay`. The default is 8 hours, matching SonarQube's default.

The keys of the public `Metrics` type are now optional. They were required, so every added metric key broke the consumers building a `FindingSummary`, which is what made adding `security_hotspots` and `sqale_index` a breaking change rather than an additive one.
