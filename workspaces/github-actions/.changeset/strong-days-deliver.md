---
'@backstage-community/plugin-github-actions': patch
---

Resolve visual issue caused by the centering of the Workflow Status was done inside the component instead of controlled by the wrapper object. This led to case where when viewing 'Workflow run details' the status was centered when all other content was left aligned.
