---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
---

Fixed the token update issue when the plugin uses the Keycloak client library. Added the ability to configure a maxConcurrency limit to control the number of parallel requests to the Keycloak server, preventing potential DoS attacks. Significantly improved the parsing of Keycloak users and group information.
