---
'@backstage-community/plugin-sonarqube-backend': minor
---

Switch from basic auth to recommended<sup>[[1]](https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/web-api/#authenticate-to-api), [[2]](https://docs.sonarsource.com/sonarqube-server/2025.1/extension-guide/web-api/#authenticate-to-api)</sup> bearer auth in order to also support SonarQube Cloud.

Basic auth as used previously is exlusively [supported](https://docs.sonarsource.com/sonarqube-server/10.8/user-guide/managing-tokens/#using-a-token) by Sonarqube Server.
