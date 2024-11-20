---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
---

Serialize the calls to get groups and users from Keycloak. In cases where there was a large number of users and / or groups, originally the keycloak would make many async calls that would lead to DOS of the keycloak server.
