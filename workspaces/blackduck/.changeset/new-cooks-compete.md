---
'@backstage-community/plugin-blackduck-backend': patch
---

Added `@backstage-community/plugin-blackduck-node` as dependency

**BREAKING** `BlackDuckConfig` & `BlackDuckHostConfig` are moved to `@backstage-community/plugin-blackduck-node` package.

````diff
- export class BlackDuckConfig {
-   constructor(hosts: BlackDuckHostConfig[], defaultHost: string);
-   // (undocumented)
-   static fromConfig(config: Config): BlackDuckConfig;
-   // (undocumented)
-   getHostConfigByName(name: string): BlackDuckHostConfig;
- }

- // @public (undocumented)
- export interface BlackDuckHostConfig {
-   // (undocumented)
-   host: string;
-   // (undocumented)
-   name: string;
-   // (undocumented)
-   token: string;
- }```
````
