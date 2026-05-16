# MUI to BUI Migration Analytics

This document describes the migration analytics tool that tracks the progress of migrating from Material-UI to `@backstage/ui` components across all workspace plugins in the Backstage Community Plugins repository.

## Overview

The migration analytics script uses TypeScript AST (Abstract Syntax Tree) parsing to accurately analyze import statements and component usage throughout the codebase. It generates comprehensive reports showing:

- Per-workspace migration progress
- Component usage statistics
- Priority recommendations for migration
- Detailed breakdowns by library version

## Live Migration Tracker

The migration progress is automatically tracked and updated daily in [Issue #7023](https://github.com/backstage/community-plugins/issues/7023).

## Features

- 🔍 **TypeScript AST parsing** - Accurate analysis of imports and component usage
- 🎯 **Component discovery** - Automatically discovers all components from import statements
- 📝 **Complex import patterns** - Handles aliases, destructuring, and mixed imports
- ⚡ **Reliable tracking** - Distinguishes between MUI and BUI components with the same name
- 📦 **Per-workspace tracking** - Individual progress for each workspace plugin
- 📊 **Multiple export formats** - Text, JSON, CSV, and GitHub-optimized markdown

## Usage

### Run the Script

```bash
# Analyze all workspaces
yarn mui-to-bui

# Analyze a specific workspace
yarn mui-to-bui --workspace <workspace-name>

# Generate markdown report (for GitHub issues)
yarn mui-to-bui --markdown

# Export as JSON
yarn mui-to-bui --json

# Export as CSV
yarn mui-to-bui --csv

# Show help
yarn mui-to-bui --help
```

### Available Options

| Option               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `--json`             | Export detailed results as JSON                        |
| `--csv`              | Export component usage as CSV                          |
| `--markdown`         | Generate GitHub-optimized markdown (for issue updates) |
| `--workspace <name>` | Analyze specific workspace only                        |
| `--help`, `-h`       | Show help message                                      |

## Examples

### Analyze All Workspaces

```bash
yarn mui-to-bui
```

This will analyze all 100+ workspace plugins and generate a comprehensive text report showing:

- Overall migration statistics
- Per-workspace status
- Top components by usage
- Migration recommendations

### Analyze a Specific Workspace

```bash
yarn mui-to-bui --workspace argocd
```

Useful for:

- Focusing on a specific plugin
- Faster analysis during development
- Understanding migration needs for a single workspace

### Generate Markdown for GitHub

```bash
yarn mui-to-bui --markdown > migration-report.md
```

This generates a formatted markdown report suitable for posting to GitHub issues or documentation. The report includes:

- Progress bar visualization
- Workspace status tables
- Component usage breakdowns
- Priority recommendations

### Export Data for Analysis

```bash
# JSON format - for programmatic analysis
yarn mui-to-bui --json > migration-data.json

# CSV format - for spreadsheet analysis
yarn mui-to-bui --csv > components.csv
```

## Understanding the Output

### Migration Status Categories

| Status                 | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| ✅ **Fully Migrated**  | Workspace uses only `@backstage/ui` components (no MUI) |
| 🔄 **Mixed (Partial)** | Workspace has both MUI and Backstage UI components      |
| ❌ **Not Started**     | Workspace uses only MUI components (no Backstage UI)    |

### Progress Calculation

- **Overall Progress** - Percentage of files that have migrated from MUI to BUI
- **Per-Workspace Progress** - Percentage calculated as: `(BUI files) / (MUI files + BUI files)`

### Component Tracking

Components are tracked separately by library to avoid confusion:

- `Grid (MUI)` - Material-UI Grid component that needs migration
- `Grid (BUI)` - Backstage UI Grid component (already migrated)

This distinction is important because some components (like `CardHeader`, `Button`, `Link`) exist in both libraries.

## Automated Updates

The migration tracker runs automatically via GitHub Actions:

- **Schedule**: Daily at midnight UTC
- **Workflow**: [`.github/workflows/mui-migration-tracker.yml`](../.github/workflows/mui-migration-tracker.yml)
- **Output**: Updates [Issue #7023](https://github.com/backstage/community-plugins/issues/7023)

You can also manually trigger the workflow from the [Actions tab](https://github.com/backstage/community-plugins/actions/workflows/mui-migration-tracker.yml).

## How It Works

1. **Discovery** - Finds all workspace plugins in `/workspaces` (excluding `noop` and `repo-tools`)
2. **AST Parsing** - Uses `ts-morph` to parse TypeScript/JavaScript files
3. **Import Analysis** - Identifies imports from MUI and Backstage UI packages
4. **Component Usage** - Tracks JSX element usage through the AST
5. **Aggregation** - Combines data across all workspaces
6. **Reporting** - Generates comprehensive reports in multiple formats

## Tracked Libraries

### Material-UI (Need Migration)

- `@material-ui/core` - MUI v4 Core
- `@material-ui/lab` - MUI v4 Lab
- `@material-ui/icons` - MUI v4 Icons
- `@material-ui/pickers` - MUI v4 Pickers
- `@mui/material` - MUI v5 Material
- `@mui/lab` - MUI v5 Lab
- `@mui/icons-material` - MUI v5 Icons
- `@mui/styles` - MUI v5 Styles

### Backstage UI (Target Library)

- `@backstage/ui` - Backstage UI components

## Contributing

If you notice any issues with the analytics or have suggestions for improvements:

1. Open an issue describing the problem or enhancement
2. For code changes, the script is located at: `scripts/mui-to-bui.js`
3. Ensure changes are tested with: `yarn mui-to-bui --workspace <test-workspace>`

## Related Resources

- [Migration Tracker Issue](https://github.com/backstage/community-plugins/issues/7023)
- [Analytics Script](../scripts/mui-to-bui.js)
- [GitHub Workflow](../.github/workflows/mui-migration-tracker.yml)
- [Backstage UI Documentation](https://backstage.io/docs/ui/overview)
