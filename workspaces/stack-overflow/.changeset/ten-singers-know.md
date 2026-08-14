---
'@backstage-community/plugin-stack-overflow': major
---

The stack-overflow plugin was successfully migrated from Material-UI to Backstage UI. Key changes included replacing MUI components (List, ListItem, Chip, Box, Divider, Typography) with BUI equivalents (Text) and custom HTML layouts. MUI icons were replaced with Remixicon v4.0.0 (RiExternalLinkLine). Styling now uses BUI CSS variables (--bui-border-1, --bui-bg-muted, --bui-fg-secondary) with inline styles for custom layouts. The package.json was updated to remove @material-ui/\* dependencies and add @backstage/ui and @remixicon/react. All TypeScript and ESLint checks pass successfully.
