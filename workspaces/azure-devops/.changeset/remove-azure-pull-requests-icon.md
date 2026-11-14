---
'@backstage-community/plugin-azure-devops': minor
---

**BREAKING** Removed the deprecated `AzurePullRequestsIcon`. If you use it in your sidebar, replace it with `RiGitPullRequestLine` from `@remixicon/react`. First add the dependency to your app:

```sh
yarn --cwd packages/app add @remixicon/react
```

Then update the import:

```diff
- import { AzurePullRequestsIcon } from '@backstage-community/plugin-azure-devops';
+ import { RiGitPullRequestLine } from '@remixicon/react';

- <SidebarItem icon={AzurePullRequestsIcon} to="azure-pull-requests" text="Azure PRs" />
+ <SidebarItem icon={RiGitPullRequestLine} to="azure-pull-requests" text="Azure PRs" />
```
