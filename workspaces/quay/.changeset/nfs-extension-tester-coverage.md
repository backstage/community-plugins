---
'@backstage-community/plugin-quay': patch
---

Add tests covering the Quay tab as the New Frontend System declares it: its title, route path, the route it resolves links against, the entities it is offered for, and what it renders. The API and entity content extensions are now exported from the plugin module, so apps that build against the module directly can override them.
