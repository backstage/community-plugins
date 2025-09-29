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

1. **Navigate to plugin directory**

   ```bash
   cd /Users/sraradhy/cisco/eti/sre/community-plugins/workspaces/agent-forge/plugins/agent-forge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the package**

   ```bash
   npm run build
   ```

4. **Test the build**

   ```bash
   npm test
   ```

5. **Publish to npm**
   ```bash
   npm version patch && npm publish
   ```

## Package Details

- **Package Name**: `@caipe/plugin-agent-forge`
- **Current Version**: `0.3.3`
- **npm Package URL**: https://www.npmjs.com/package/@caipe/plugin-agent-forge
- **Registry**: https://www.npmjs.com/settings/caipe/packages
- **Access**: Public

## Installation for Users

```bash
npm install @caipe/plugin-agent-forge
# or
yarn add @caipe/plugin-agent-forge
```

## Usage in Backstage

```tsx
import { ChatAssistantPage } from '@caipe/plugin-agent-forge';
```
