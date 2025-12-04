# Persisted feature flags

This plugin complements the built-in feature flags, by allowing plugins to register _persistent_ feature flags and not just in-browser stored feature flags. Persistent feature flags are stored using the built-in StorageApi which can be configured to use the user-settings plugin for storing values in the database. This means the flags remain active as users switch browsers, computers, etc.

The plugin uses the New frontend system, and is installed as:

```bash
$ yarn --cwd packages/app add @backstage-community/plugin-persisted-feature-flags
```

## Usage

It's generally straight forward to start using this plugin and changing a plugin's feature flags registration from locally stored to backend persisted. The plugin also automatically handles _converting_ from a locally stored feature flag into a persited one, to keep each user's choice. As more and more feature flags move from locally stored to persisted, they will be converted for each user when they load the page.

To start using this plugin, follow these three steps:

1.  Change the Settings tab for Feature flags
2.  Adopt this feature flag API in favor of the built-in feature flag API
3.  Transition the plugins' feature flags one by one

### 1. Change the Settings tab

The built-in Settings page has a tab for "Feature flags", where users can toggle them on and off. This tab only understands locally (in-browser) stored flags.

The `@backstage-community/plugin-persisted-feature-flags` package provides its own UI for this, which supports both local and persisted feature flags seamlessly with no visual difference for the users.

There is currently no way to _customize_ (or replace) what the "Feature flags" tab in the Settings page should display, other than providing the entire frame of the settings page. This is quite easy though, following the [README for user-settings](https://github.com/backstage/backstage/tree/master/plugins/user-settings#props).

This example shows the default settings page, but with the feature flags tab replaced with the one in this plugin.

```tsx
import {
  SettingsLayout,
  UserSettingsGeneral,
  UserSettingsAuthProviders,
} from '@backstage/plugin-user-settings';

import { UserSettingsFeatureFlags } from '@backstage-community/plugin-persisted-feature-flags';

export const customSettingsPage = (
  <SettingsLayout>
    <SettingsLayout.Route path="general" title="General">
      <UserSettingsGeneral />
    </SettingsLayout.Route>
    <SettingsLayout.Route
      path="auth-providers"
      title="Authentication providers"
    >
      <UserSettingsAuthProviders />
    </SettingsLayout.Route>
    <SettingsLayout.Route path="feature-flags" title="Feature Flags">
      <UserSettingsFeatureFlags />
    </SettingsLayout.Route>
  </SettingsLayout>
);
```

Then use this content for the Settings page, in `App.tsx`:

```tsx
<Route path="/settings" element={<UserSettingsPage />}>
  {customSettingsPage}
</Route>
```

### 2. Use the new feature flag API

Converting the usage of feature flags is as easy as moving current logic:

```ts
import { featureFlagsApiRef, useApi } from '@backstage/core-plugin-api';

// ...

const featureFlagsApi = useApi(featureFlagsApiRef);
const enabled = featureFlagsApi.isActive('my-flag');
```

into:

```ts
import { useFeatureFlag } from '@backstage-community/plugin-persisted-feature-flags-react';

// ...

const enabled = useFeatureFlag('my-flag');
```

This is safe to do _before_ having converted any feature flag, as `useFeatureFlag()` supports both the built-in (local) feature flags, and persistent feature flags, and will return the persisted feature flag state if such is registered from a plugin.

All usages of feature flags throughout a Backstage codebase can safely be converted this way, at any moment.

NOTE; Logic not running in a component does not have access to React hooks, like `useFeatureFlag()`. In that case, call `isActive(flagName)` on the `PersistedFeatureFlagsApi`.

### 3. Transition the feature flag registration

You can now convert a built-in feature flag into a persisted one.

For an existing plugin which is created like this:

```ts
export const myPlugin = createFrontendPlugin({
  pluginId: 'my-plugin',
  featureFlags: [{ name: 'my-flag' }],
});
```

Turn the feature flag into an extension like this:

```ts
import { createPersistedFeatureFlag } from '@backstage-community/plugin-persisted-feature-flags-react';

const featureFlags = createPersistedFeatureFlag({
  name: 'my-flag',
  description: 'Enables a cool new feature',
});

export const myPlugin = createFrontendPlugin({
  pluginId: 'my-plugin',
  extensions: [featureFlags],
});
```

Now, `my-flag` will be converted for each user and stored server-side. The `createPersistedFeatureFlag` function can also take an array of feature flags, if multiple should be registered from the same plugin.

## Configuration

By default, if the hostname is `localhost`, strict mode is enabled, otherwise not. This can also be configured using the extension id `api:persisted-feature-flags` setting `strict` to a boolean:

```yaml title="app-config.yaml"
app:
  extensions:
    - api:persisted-feature-flags:
        config:
          strict: true
```

Strict mode will cause errors to be thrown when trying to access or set a feature flag that has not been registered. In non-strict mode, it'll default to a silent `false` value. It's useful to keep the defaults and run in strict-mode for developers, to detect conflicting or misspelled feature flags.
