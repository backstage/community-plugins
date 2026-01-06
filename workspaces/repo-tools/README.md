# Community Plugins Repo Tooling

CLI tools for managing the community plugins repository.

## Usage

```bash
yarn community-cli <command>
```

## Available Commands

| Command                       | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `workspace list`              | List all available workspaces                     |
| `workspace create`            | Create a new workspace (interactive)              |
| `plugin migrate`              | Migrate plugins from backstage/backstage monorepo |
| `lint legacy-backend-exports` | Lint backend plugins for export patterns          |

## Examples

```bash
# List workspaces
yarn community-cli workspace list

# List workspaces as JSON
yarn community-cli workspace list --json

# Create new workspace
yarn community-cli workspace create

# Get help
yarn community-cli --help
```

## Development

```bash
cd packages/cli
yarn build
```
