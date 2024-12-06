---
'@backstage-community/plugin-scaffolder-backend-module-jenkins': minor
---

Introduced build,copy,create,destroy,disable and enable actions, also added jenkins client to interact with instance. Refactoring jenkins:job:create action to use jenkins client and renamed into jenkins:job:create-file

**BREAKING**: old action jenkins:job:create now is renamed into jenkins:job:create-file because is working with file path as input parameter, open readme to know how to use it
