# @backstage-community/plugin-catalog-backend-module-unclaimed-entities

The unclaimed-entities backend module for the catalog plugin.

This module provides a generic entity provider that discovers repositories from existing catalog integrations without catalog-info.yaml files and creates "Unclaimed" catalog entities for them.

## Features

- Works with any SCM provider supported by Backstage integrations (GitHub, GitLab, Azure DevOps, Bitbucket)
- Leverages existing integration configurations (no duplicate tokens needed)
- Automatically detects repositories that don't have catalog-info.yaml files
- Creates catalog entities with new "Unclaimed" kind for easy identification
- Configurable provider selection - choose which integrations to scan
- Scheduled discovery with configurable intervals
- Full integration with Backstage's catalog system

## Installation

1. Install the module in your Backstage backend:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-unclaimed-entities
```

1. Add the module to your backend in `packages/backend/src/index.ts`:

```typescript
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-unclaimed-entities'
  ),
);
```

## Configuration

Add the following configuration to your `app-config.yaml`:

```yaml
catalog:
  rules:
    - allow: [Component, System, API, Resource, Location, Unclaimed]
  providers:
    unclaimed:
      providers:
        - type: github
          organization: my-org
        - type: azure
          organization: my-azure-org
          project: my-project # Optional: specific project
        - type: gitlab
          organization: my-group
        - type: bitbucket
          organization: my-workspace
      schedule:
        frequency: { hours: 6 } # Run every 6 hours
        timeout: { minutes: 10 }
```

### Configuration Options

#### Provider Configuration

Each provider in the `providers` array supports:

- `type` (required): Provider type (`github`, `gitlab`, `azure`/`azuredevops`, `bitbucket`)
- `host` (optional): Custom host (defaults to provider's public instance)
- `organization` (required): Organization/namespace/workspace to scan
- `project` (optional): Specific project/group (for providers that support it)
- `config` (optional): Additional provider-specific configuration

#### Schedule Configuration

- `frequency`: How often to run discovery (supports minutes, hours, days)
- `timeout`: Maximum time allowed for each discovery run

### Using Existing Integrations

The provider automatically uses your existing integration configurations. Make sure you have the appropriate integrations configured:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
  azure:
    - host: dev.azure.com
      credentials:
        - personalAccessToken: ${AZURE_DEVOPS_PAT}
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}
  bitbucket:
    - host: bitbucket.org
      token: ${BITBUCKET_TOKEN}
```

## Generated Entities

The provider creates entities with the new **Unclaimed** kind:

- **Kind**: `Unclaimed`
- **Type**: `repository`
- **Lifecycle**: `unknown`
- **Namespace**: Normalized organization name
- **Tags**: `['unclaimed', '<host>']`
- **Labels**:
  - `backstage.io/unclaimed: 'true'`
  - `scm.host: <host>`
  - `scm.organization: <organization>`

### Annotations

Each unclaimed entity includes standardized SCM annotations:

- `scm.host`: SCM provider host
- `scm.organization`: Organization/namespace
- `scm.project`: Project (if applicable)
- `scm.repository-id`: Repository ID
- `scm.repository-url`: API URL for the repository
- `scm.web-url`: Web URL for the repository
- `scm.default-branch`: Default branch name

## Usage

Once configured, the provider will:

1. Connect to your configured SCM providers using existing integrations
2. Scan specified organizations/projects for repositories
3. Check each repository for the presence of catalog-info.yaml files
4. Create Unclaimed entities for repositories without catalog files
5. Update the catalog with discovered unclaimed entities

### Identifying Unclaimed Entities

You can identify unclaimed entities in several ways:

1. **By kind**: Filter for entities with kind `Unclaimed`
2. **By label**: Filter for entities with `backstage.io/unclaimed: 'true'`
3. **By tag**: Filter for entities tagged with `unclaimed`

### Next Steps

After discovering unclaimed entities, you can:

1. Review the entities in the Backstage catalog
2. Create catalog-info.yaml files for important repositories
3. Set up proper ownership and metadata
4. Use the entities as a starting point for software catalog adoption

## Supported Providers

- **GitHub**: Public and Enterprise instances
- **GitLab**: Public and self-hosted instances
- **Azure DevOps**: Azure DevOps Services and Server
- **Bitbucket**: Cloud and Server instances

## Permissions

The provider uses your existing integration tokens, so ensure they have the necessary permissions:

- **Repository read access**: To list and access repository information
- **Organization/project read access**: To list organizations and projects

## Troubleshooting

### Common Issues

1. **Authentication failures**: Verify your integration tokens are correct and have necessary permissions
2. **No entities discovered**: Check that your organization and provider configurations are correct
3. **Rate limiting**: If you have many repositories, consider adjusting the timeout configuration

### Debugging

Enable debug logging by setting the log level to debug in your backend configuration:

```yaml
backend:
  logging:
    level: debug
```

Look for log messages from `UnclaimedEntityProvider` to troubleshoot discovery issues.

## Migration from Azure-specific Provider

If you were using the previous Azure-specific provider, update your configuration:

**Old configuration:**

```yaml
catalog:
  providers:
    azureDevopsUnclaimed:
      organization: my-org
      personalAccessToken: ${AZURE_DEVOPS_PAT}
```

**New configuration:**

```yaml
catalog:
  rules:
    - allow: [Component, System, API, Resource, Location, Unclaimed]
  providers:
    unclaimed:
      providers:
        - type: azure
          organization: my-org
```

The new provider will use your existing Azure DevOps integration configuration.
