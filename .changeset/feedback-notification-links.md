---
'@backstage-community/plugin-entity-feedback-backend': patch
'@backstage-community/plugin-entity-feedback': patch
'@backstage-community/plugin-entity-feedback-common': patch
---

Add clickable link to feedback notifications. When entity owners receive notifications about new feedback, the notification now includes a link to navigate directly to the entity page. The entity URL is derived from the frontend routing configuration using the same logic as `EntityRefLink`, ensuring it always matches the actual routes configured in the app without requiring additional backend configuration.
