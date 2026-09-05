---
'@backstage-community/plugin-rbac-backend': minor
---

Store Casbin policies with the plugin Knex database client instead of TypeORM. Role metadata, conditional policies, and Casbin rules now share one connection pool and can commit or roll back together. Existing casbin_rule data is unchanged.
