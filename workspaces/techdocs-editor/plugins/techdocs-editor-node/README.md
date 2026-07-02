# @backstage-community/plugin-techdocs-editor-node

Node.js utilities and the VCS provider extension point for the TechDocs Editor backend. Used by `@backstage-community/plugin-techdocs-editor-backend` and by custom backend modules that register additional VCS providers.

## Installation

```bash
yarn --cwd packages/backend add @backstage-community/plugin-techdocs-editor-node
```

## Exports

| Symbol                                    | Description                                          |
| ----------------------------------------- | ---------------------------------------------------- |
| `VcsProvider`                             | Interface all VCS providers must implement           |
| `VcsProviderExtensionPoint`               | Interface for the extension point itself             |
| `OpenPrOptions`                           | Options passed to `VcsProvider.openPullRequest`      |
| `OpenPrResult`                            | Result returned by `VcsProvider.openPullRequest`     |
| `techdocsEditorVcsProviderExtensionPoint` | Extension point for registering custom VCS providers |

## VcsProvider Interface

Implement this interface in a backend module to add support for a new SCM host:

```ts
import type {
  VcsProvider,
  OpenPrOptions,
  OpenPrResult,
} from '@backstage-community/plugin-techdocs-editor-node';

export class BitbucketVcsProvider implements VcsProvider {
  readonly id = 'bitbucket';

  canHandle(repoUrl: string): boolean {
    return new URL(repoUrl).host === 'bitbucket.org';
  }

  async getDefaultBranch(repoUrl: string): Promise<string> {
    // ...call Bitbucket API
    return 'main';
  }

  async readFile(opts: { repoUrl: string; ref: string; filePath: string }) {
    // ...return { content, etag }
  }

  async listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]> {
    // ...return relative paths
  }

  async openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult> {
    // ...create PR, return { url, number }
  }
}
```

Register it with the extension point:

```ts
import { techdocsEditorVcsProviderExtensionPoint } from '@backstage-community/plugin-techdocs-editor-node';
import { createBackendModule } from '@backstage/backend-plugin-api';

export const techdocsEditorModuleBitbucket = createBackendModule({
  pluginId: 'techdocs-editor',
  moduleId: 'bitbucket-provider',
  register(env) {
    env.registerInit({
      deps: { vcs: techdocsEditorVcsProviderExtensionPoint },
      async init({ vcs }) {
        vcs.addProvider(new BitbucketVcsProvider());
      },
    });
  },
});
```

## Links

- [Backend plugin](../techdocs-editor-backend/README.md)
- [Shared types & permissions](../techdocs-editor-common/README.md)
