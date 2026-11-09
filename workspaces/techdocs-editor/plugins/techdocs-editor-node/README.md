# @backstage-community/plugin-techdocs-editor-node

[![npm](https://img.shields.io/npm/v/%40backstage-community%2Fplugin-techdocs-editor-node)](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-node)
[![CI](https://github.com/backstage/community-plugins/tree/main/workspaces/techdocs-editor/actions/workflows/ci.yaml/badge.svg)](https://github.com/backstage/community-plugins/tree/main/workspaces/techdocs-editor/actions/workflows/ci.yaml)

Node library that defines the extension point and interfaces for custom VCS (Version Control System) providers in the TechDocs editor backend. Use this package to add support for a VCS platform beyond the bundled GitHub and GitLab providers.

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-techdocs-editor-node
```

## When to use this package

The backend plugin (`@backstage-community/plugin-techdocs-editor-backend`) ships with built-in providers for **GitHub** and **GitLab**. You only need this package if you want to add support for a different VCS host (e.g. Bitbucket Server, Azure DevOps, Gitea, etc.).

## Implementing a custom VCS provider

Create a class that implements the `VcsProvider` interface:

```ts
import type {
  VcsProvider,
  OpenPrOptions,
  OpenPrResult,
  VcsFileResult,
} from '@backstage-community/plugin-techdocs-editor-node';

export class MyVcsProvider implements VcsProvider {
  /** Return true if this provider handles the given repo URL */
  supports(repoUrl: string): boolean {
    return repoUrl.startsWith('https://mygithost.internal/');
  }

  async getDefaultBranch(repoUrl: string): Promise<string> {
    // fetch the default branch from your VCS API
    return 'main';
  }

  async listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]> {
    // return a flat list of file paths relative to the repo root
    return [];
  }

  async readFile(opts: {
    repoUrl: string;
    ref: string;
    filePath: string;
  }): Promise<VcsFileResult> {
    // return the file content and an opaque ETag for conflict detection
    return { content: '...', etag: 'abc123' };
  }

  async openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult> {
    // commit files to a new branch and open a PR/MR
    return { url: 'https://mygithost.internal/org/repo/pull/42' };
  }
}
```

## Registering a custom provider

Create a Backstage backend module and use the `techdocsEditorVcsProviderExtensionPoint` to register your provider:

```ts
import { createBackendModule } from '@backstage/backend-plugin-api';
import { techdocsEditorVcsProviderExtensionPoint } from '@backstage-community/plugin-techdocs-editor-node';
import { MyVcsProvider } from './MyVcsProvider';

export const techdocsEditorModuleMyVcs = createBackendModule({
  pluginId: 'techdocs-editor',
  moduleId: 'my-vcs',
  register(reg) {
    reg.registerInit({
      deps: {
        extensionPoint: techdocsEditorVcsProviderExtensionPoint,
      },
      async init({ extensionPoint }) {
        extensionPoint.addProvider(new MyVcsProvider());
      },
    });
  },
});
```

Then add it to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(import('@backstage-community/plugin-techdocs-editor-backend'));
backend.add(
  import('@backstage-community/plugin-techdocs-editor-backend/alpha'),
);
backend.add(import('./modules/techdocsEditorModuleMyVcs'));
```

## Exported API

### `techdocsEditorVcsProviderExtensionPoint`

The Backstage extension point token. Inject this in your backend module to register providers.

### Interfaces

| Type                        | Description                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `VcsProvider`               | Interface all VCS provider implementations must satisfy                             |
| `VcsProviderExtensionPoint` | Extension point interface exposing `addProvider(provider: VcsProvider): void`       |
| `OpenPrOptions`             | Options passed to `openPullRequest` — files, branch, PR title, commit message, etc. |
| `OpenPrResult`              | Result returned by `openPullRequest` — contains the PR/MR URL                       |
| `VcsFileResult`             | Result returned by `readFile` — contains `content: string` and `etag: string`       |

## Related packages

| Package                                                                                                                                    | Description                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [`@backstage-community/plugin-techdocs-editor-backend`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-backend) | Backend plugin that consumes this extension point |
| [`@backstage-community/plugin-techdocs-editor-common`](https://www.npmjs.com/package/@backstage-community/plugin-techdocs-editor-common)   | Shared types referenced in VCS provider options   |

## License

Apache-2.0
