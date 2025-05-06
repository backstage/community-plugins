---
'@backstage-community/plugin-sonarqube-backend': patch
---

This undoes the breaking Authorization header change introduced in v0.7.0 and allows configuring Bearer tokens, while maintaining the old default of Basic.
