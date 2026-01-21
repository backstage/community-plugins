# Persisted feature flags, react package

This package contains the persisted feature flags API and hooks.

## Usage

- `createPersistedFeatureFlag()` Create a feature flag extension to attach to a plugin.
- `FeatureFlagBlueprint` The underlying blueprint of `createPersistedFeatureFlag`
- `useFeatureFlag()` Hook to get the state of a feature flag, local (built-in) or persisted
- `useHandleFeatureFlag()` Hook for _managing_ (e.g. setting) a feature flag
