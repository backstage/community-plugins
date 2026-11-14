---
'@backstage-community/plugin-azure-devops': minor
---

**BREAKING** Removed the deprecated `AzurePullRequestsIcon`. If you use it in your sidebar, replace it with `RiGitPullRequestLine` from `@remixicon/react`:

```diff
- import { AzurePullRequestsIcon } from '@backstage-community/plugin-azure-devops';
+ import { RiGitPullRequestLine } from '@remixicon/react';

- <SidebarItem icon={AzurePullRequestsIcon} to="azure-pull-requests" text="Azure PRs" />
+ <SidebarItem icon={RiGitPullRequestLine} to="azure-pull-requests" text="Azure PRs" />
```
