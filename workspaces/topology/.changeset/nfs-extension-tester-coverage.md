---
'@backstage-community/plugin-topology': patch
---

Add tests covering the Topology tab as the New Frontend System declares it: its title, route path, the entities it is offered for, what it renders, and the Kubernetes read permissions that gate it. The entity content extension is now exported from the plugin module, so apps that build against the module directly can override it.
