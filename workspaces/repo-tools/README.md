# Community Plugins Repo Tooling

CLI tools for managing the community plugins repository.

## Usage

```bash
npx community-cli <command>
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
npx community-cli workspace list

# List workspaces as JSON
npx community-cli workspace list --json

# Create new workspace
npx community-cli workspace create

# Get help
npx community-cli --help
```

## Development

```bash
cd packages/cli
yarn build
```
