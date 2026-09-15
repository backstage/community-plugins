---
'@backstage-community/plugin-quay': patch
---

Add tests covering the Quay tab and API as the New Frontend System declares them: the tab's title, route path, the route it resolves links against, the entities it is offered for, what it renders, and the APIs the registry client is built from. The API and entity content extensions are now exported from the plugin module, so apps that build against the module directly can override them.
