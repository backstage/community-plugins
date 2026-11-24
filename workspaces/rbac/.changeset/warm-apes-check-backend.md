---
'@backstage-community/plugin-rbac-backend': minor
---

Added a read-only access check endpoint (`GET /access-check?userEntityRef=...`) that explains the decisions the permission policy makes for a user: the user's roles with how the user is connected to each, and per plugin permission whether the answer is allow, deny, or conditional, together with the roles each decision comes from. The endpoint requires unrestricted policy read access.
