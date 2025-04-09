# SonarQube Module with DevOps Integrations

This plugin provides a set of actions for the Backstage Scaffolder that integrate SonarQube with various DevOps tools.

## Features

- Create SonarQube projects
- Generate configuration for SonarQube analysis in:
  - GitHub Actions
  - Jenkins
  - Azure DevOps
  - GitLab CI/CD

## Documentation

For full documentation and usage examples, please refer to the [module documentation](../../README.md).

## Installation

```bash
# From your Backstage root directory
yarn add --cwd packages/backend @backstage/scaffolder-backend-module-sonarqube-v2
```

## Configuration

Register this module with your scaffolder backend plugin:

```typescript
// In packages/backend/src/plugins/scaffolder.ts
import { scaffolderModuleSonarqubeV2Actions } from '@backstage/scaffolder-backend-module-sonarqube-v2';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // ... other configuration

  // Load the SonarQube v2 actions module
  await scaffolderModuleSonarqubeV2Actions.register(env.scaffolderInit);

  // ... rest of configuration
}
```
