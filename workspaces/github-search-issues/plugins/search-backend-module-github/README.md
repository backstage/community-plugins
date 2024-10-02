# Github Search Module

This search module for GitHub indexes GitHub issues and makes them searchable inside your Backstage instance. This allows for better transparency and exposes your issues to a wider audience, facilitating better communication of help wanted for open-source projects within your organization.

## Installation

To configure the plugin using the new backend system:

1. In the `packages/backend/src/index.ts` file, add the following:

   ```typescript
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   backend.add(import('@backstage-community/search-backend-module-github'));

   backend.start();
   ```

## Configuration

### Environment Variables

To configure the module, you need to set the following environment variables:

- **`search.collators.github.org`** The organztion to which we make the search.
- **`search.collators.github.query`** The actual query string used to make a search at the github api. Example: is:issue is:open org:backstage

### GitHub Credentials

#### Token

**Important:** The GitHub token, which is necessary for authentication, should be managed within your Backstage integrations configuration. The token must be added to your GitHub integration settings, and the plugin will retrieve it through the `GithubCredentialsProvider`.

Ensure that your GitHub integration in the Backstage configuration includes the necessary token for the `GithubCredentialsProvider` to work correctly.

#### App

You can also authenticate using your github app. [Read more here.](https://backstage.io/docs/integrations/github/github-apps)

**Note**: If you're using the app method, you'll have to ensure that the org is inside the allowedInstallationOwners.

### YAML Configuration Example

```yaml
search:
  collators:
    github:
      orgUrl: https://github.com/backstage/
      host: github.com
      query: is:issue is:open org:backstage
```
