---
'@backstage-community/plugin-sonarqube-backend': minor
---

**BREAKING** This undoes the breaking Authorization header change introduced in v0.7.0 and allows configuring Bearer tokens, while maintaining the old default of Basic. This change will impact SonarQube Cloud users, [details on the config changes needed](https://github.com/backstage/community-plugins/tree/main/workspaces/sonarqube/plugins/sonarqube-backend) in this case are in the `README`.
