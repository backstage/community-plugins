---
'@backstage-community/plugin-jenkins': minor
'@backstage-community/plugin-jenkins-backend': minor
---

Support jobs from multiple named Jenkins instances on the same catalog entity while preserving the source instance for build details, history, logs, and retries.

When some of an entity's instances fail, the projects endpoint and the `jenkins:list-builds` action return the jobs of the others plus an `errors` list naming each failing instance; they only fail when every instance does. `JenkinsApi` gains an optional `getProjectsWithErrors` method, and the projects table warns about the failing instances and only shows the Instance column when the jobs come from several instances.

`JenkinsClient` now throws a `ResponseError` when the backend responds with an error, instead of returning an empty list of projects or an undefined build.
