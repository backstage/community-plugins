# Splunk On-Call Plugin - Dependency Migration Plan

## Current Dependencies (to be REMOVED)

```json
"@material-ui/core": "^4.12.2",
"@material-ui/icons": "^4.9.1",
"@material-ui/lab": "4.0.0-alpha.61",
```

## New Dependencies (to be ADDED)

Add to `dependencies` section in `plugins/splunk-on-call/package.json`:

```json
"@backstage/ui": "^1.7.0",
"@remixicon/react": "^4.3.0",
"react-aria-components": "^1.4.0"
```

> **Note:** If you're in the Backstage monorepo, use `"@backstage/ui": "backstage:^"` instead. The `backstage:` protocol is a monorepo-specific version resolver and is not valid for standard npm/yarn registries outside Backstage's monorepo setup.

## Recommended Migration Checklist

### 1. Update package.json

- [ ] Remove @material-ui/core, @material-ui/icons, @material-ui/lab
- [ ] Add @backstage/ui
- [ ] Add @remixicon/react
- [ ] Add react-aria-components
- [ ] Run: `yarn install`

### 2. Create CSS Module Files

- [ ] EntitySplunkOnCallCard.module.css
- [ ] TriggerDialog.module.css
- [ ] EscalationPolicy.module.css
- [ ] EscalationUser.module.css
- [ ] EscalationUsersEmptyState.module.css
- [ ] Incidents.module.css
- [ ] IncidentListItem.module.css
- [ ] IncidentEmptyState.module.css
- [ ] MissingApiKeyOrApiIdError.module.css

### 3. Migrate Components (Recommended Order)

1. MissingApiKeyOrApiIdError.tsx
2. IncidentEmptyState.tsx
3. EscalationUsersEmptyState.tsx
4. EntitySplunkOnCallCard.tsx
5. EscalationPolicy.tsx
6. EscalationUser.tsx
7. Incidents.tsx
8. IncidentListItem.tsx
9. TriggerDialog.tsx (most complex)

### 4. Test Migration

- [ ] Run: `yarn build`
- [ ] Run: `yarn test`
- [ ] Manual testing in dev app
- [ ] Verify all component interactions

### 5. Cleanup

- [ ] Remove old test mocks for MUI components
- [ ] Update documentation
- [ ] Update CHANGELOG

## Installation Command

For **standard npm/yarn registries** (recommended for most setups):

```bash
cd plugins/splunk-on-call
yarn add @backstage/ui@^1.7.0 @remixicon/react@^4.3.0 react-aria-components@^1.4.0
yarn remove @material-ui/core @material-ui/icons @material-ui/lab
yarn install
```

For **Backstage monorepo** setups only, update `package.json` manually:

```json
"@backstage/ui": "backstage:^",
```

Then run: `yarn install`

## Version Compatibility

- @backstage/ui: Requires React 16.13+ (compatible with current setup)
- @remixicon/react: v4.3.0 (latest, lightweight)
- react-aria-components: v1.4.0 (latest stable)
