# Publishing @caipe/plugin-agent-forge to npm

## Prerequisites

1. **npm account with @caipe organization access**

   ```bash
   npm login
   npm whoami
   ```

2. **Verify organization membership**
   ```bash
   npm org ls caipe
   ```

## Build and Publish Steps

1. **Navigate to plugin directory from the root of the community-plugins**

   ```bash
   # From community-plugins root directory
   cd ./workspaces/agent-forge/plugins/agent-forge
   ```

2. **Patch the version**

   ```bash
   npm version patch
   ```

3. **Build the package**

   ```bash
   npm run build
   ```

4. **Publish to npm**

```bash
 npm publish
```

## Package Details

- **Package Name**: `@caipe/plugin-agent-forge`
- **npm Package URL**: https://www.npmjs.com/package/@caipe/plugin-agent-forge
- **Registry**: https://www.npmjs.com/settings/caipe/packages
- **Access**: Public

## Installation for Users

```bash
yarn --cwd packages/app add @caipe/plugin-agent-forge
```

## Usage in Backstage

```tsx
import { ChatAssistantPage } from '@caipe/plugin-agent-forge';
```
