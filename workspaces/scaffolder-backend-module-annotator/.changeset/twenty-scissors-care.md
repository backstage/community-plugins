---
'@backstage-community/plugin-scaffolder-backend-module-annotator': minor
---

Adds a new scaffolder action to the scaffolder-backend-module-annotator to faciliate better lifecycle management when used alongside the `catalog:scaffolded-from` scaffolder action.

The `catalog:template:version` scaffolder action can be used to annotate the entities that a template generates using the annotation `backstage.io/template-version`. The versioning information can either come from the template itself (as an annotation) or be passed as input to the new action.

Also included in the changes are template examples for all scaffolder actions included in the scaffolder-backend-module-annotator plugin.
