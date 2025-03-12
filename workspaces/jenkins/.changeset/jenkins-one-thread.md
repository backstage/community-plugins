---
'@backstage-community/plugin-jenkins-backend': patch
---

Updated config schema to indicate that _either_ a `jenkins.instances` array should be provided _or_ `jenkins.baseUrl`, `jenkins.username`, and `jenkins.apiKey`, but never both.
