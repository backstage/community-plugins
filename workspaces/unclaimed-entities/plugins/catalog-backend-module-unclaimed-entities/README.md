# @backstage-community/plugin-catalog-backend-module-unclaimed-entities

The unclaimed-entities backend module for the catalog plugin.

This module provides a generic entity provider that discovers repositories from existing GitHub and Azure DevOps catalog integrations without catalog-info.yaml files and creates "Unclaimed" catalog entities for them.

## Features

- Works with GitHub and Azure DevOps integrations
- Leverages existing integration configurations (no duplicate tokens needed)
- Automatically detects repositories that don't have catalog-info.yaml files
- Creates catalog entities with new "Unclaimed" kind for easy identification
- Configurable provider selection - choose which existing providers to scan
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
    # Your existing GitHub provider configuration
    github:
      providerId:
        organization: my-org
        # ... other github provider config
    # Your existing Azure DevOps provider configuration
    azureDevOps:
      my-testorg:
        organization: my-testorg
        project: my-project # Optional: specific project
        # ... other azure devops provider config

# Unclaimed entities configuration
unclaimedentities:
  # List of GitHub provider IDs to scan for unclaimed entities
  github:
    - providerId
  # List of Azure DevOps provider IDs to scan for unclaimed entities
  azureDevops:
    - my-testorg
  schedule:
    frequency: { hours: 6 } # Run every 6 hours
    timeout: { minutes: 10 }
```

### Configuration Options

#### Provider Configuration

The unclaimed entities provider references your existing catalog provider configurations by their provider IDs:

- **GitHub providers**: List provider IDs under `unclaimedentities.github`
- **Azure DevOps providers**: List provider IDs under `unclaimedentities.azureDevops`

The provider will automatically use the organization, host, and authentication settings from your existing catalog providers.

**Important**: You must have existing GitHub or Azure DevOps catalog providers configured before using this module. The provider IDs you specify must match those in your `catalog.providers.github` or `catalog.providers.azureDevOps` configuration.

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
- **Azure DevOps**: Azure DevOps Services and Server

## Permissions

The provider uses your existing integration tokens, so ensure they have the necessary permissions:

- **Repository read access**: To list and access repository information
- **Organization/project read access**: To list organizations and projects

## Troubleshooting

### Common Issues

1. **Authentication failures**: Verify your integration tokens are correct and have necessary permissions
2. **No entities discovered**: Check that your provider IDs in `unclaimedentities` config match your existing catalog provider configurations
3. **Provider not found**: Ensure the provider ID you reference exists in your `catalog.providers.github` or `catalog.providers.azureDevOps` configuration
4. **Rate limiting**: If you have many repositories, consider adjusting the timeout configuration

### Debugging

Enable debug logging by setting the log level to debug in your backend configuration:

```yaml
backend:
  logging:
    level: debug
```

Look for log messages from `UnclaimedEntityProvider` to troubleshoot discovery issues. The provider will log warnings if it cannot find or configure specified providers.
