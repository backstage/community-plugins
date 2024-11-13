---
'@backstage-community/plugin-tekton-common': minor
'@backstage-community/plugin-tekton': minor
---

Migrate Tekton plugin from Janus-IDP community to Backstage community-plugins

- The plugin now recommends and supports a new annotation to show Tekton PipelineRuns on the CI/CD tab: `tekton.dev/cicd: "true"`
- The old annotation `janus-idp.io/tekton` is still supported. Any value there enables the plugin.
- The plugin doesn't export `TEKTON_CI_ANNOTATION`, please use `TektonAnnotations.CICD` from `@backstage-community/plugin-tekton-common` instead. This is a minor breaking change since an update also requires a npm package change.
