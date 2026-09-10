---
'@backstage-community/plugin-jfrog-artifactory': major
---

The JFrog Artifactory plugin now uses the New Frontend System as its default export. The JFrog Artifactory entity tab is registered automatically for entities with the `jfrog-artifactory/image-name` annotation.

**BREAKING**: Legacy frontend apps must import `JfrogArtifactoryPage` and `jfrogArtifactoryPlugin` from `@backstage-community/plugin-jfrog-artifactory/legacy`.

The NFS translations module is exported from `/translations`. `jfrogArtifactoryTranslations` and `jfrogArtifactoryTranslationRef` remain available from both `/translations` and `/alpha`.
