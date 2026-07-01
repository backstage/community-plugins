---
'@backstage-community/plugin-entity-validation': patch
---

Handle missing `kind` and `metadata` without crashing when validating entities. Previously the plugin crashed on entities missing these fields, hiding the underlying validation errors from the user. The plugin now surfaces those errors and labels which field is missing (for example `component:<missing name>`) in the results list.
