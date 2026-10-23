# Proposal: Guided tour plugin for Backstage (new frontend system)

## Why

New users land in Backstage without any in-product orientation, and every
plugin that ships its own features has no shared way to introduce them.
Backstage offers nothing built in for spotlight-style walkthroughs, and
third-party tour libraries (react-joyride, driver.js, shepherd) bring their
own styling, their own overlay stack and no awareness of the new frontend
system (NFS), user settings or routing.

This change adds a first-class, extension-driven guided tour system that:

- renders with `@backstage/ui` (BUI) and falls back to `react-aria` only for
  the low-level overlay/positioning primitives BUI itself is built on;
- lets _any_ NFS plugin ship one or more tours by adding an extension, with a
  dependency only on a small `-react` library, never on the tour plugin itself;
- remembers per user, in user settings, what has been seen, dismissed and
  completed;
- can auto-start tours on login or on first visit of a route, shows a tour
  that arrives later (new plugin installed) on its own, and lets users replay
  everything from a dedicated page.

## What changes

Two new workspace packages and one app-level module:

| Package                                                                      | Role                                       | Purpose                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugins/guided-tour-react` (`@internal/backstage-plugin-guided-tour-react`) | `web-library`                              | Public contract: `GuidedTourBlueprint`, `guidedTourApiRef`, types, `useGuidedTour()` hook, `data-guided-tour` target helper, markdown renderer. This is the only package other plugins depend on.                                 |
| `plugins/guided-tour` (`@internal/backstage-plugin-guided-tour`)             | `frontend-plugin`, `pluginId: guided-tour` | The engine: `api:guided-tour` (collects tours, persists progress via `storageApiRef`), `app-root-element:guided-tour/overlay` (spotlight + step popover + navigation), `page:guided-tour` at `/guided-tours` (replay/reset page). |
| `packages/app/src/modules/guided-tour`                                       | app module                                 | A "Welcome to Backstage" login tour spanning sidebar, catalog and settings.                                                                                                                                                       |

Demonstration of the "plugin ships its own tour" story:

- `plugins/example` gets a `guided-tour:example/intro` extension that
  auto-starts the first time a user navigates to `/example` and includes a
  "click the highlighted element" step. The example plugin only adds
  `@internal/backstage-plugin-guided-tour-react` to its dependencies.

Also touched:

- `packages/app/package.json`: add the two packages (discovered through
  `app.packages: all`), add the `/guided-tours` nav item to the sidebar
  settings group.
- `app-config.yaml`: document `app.extensions` toggles for individual tours
  and the `guidedTour.autoStart` kill switch (useful for e2e runs).

Nothing is removed. No backend changes: persistence reuses the existing
`@backstage/plugin-user-settings-backend` through `storageApiRef`, which the
app already wires via `@backstage/plugin-app-module-user-settings`.

## Impact

- **Other plugins**: opt-in. A plugin that adds a tour extension and the
  `-react` dependency keeps working unchanged when the guided tour plugin is
  not installed; the extension simply stays unattached.
- **Users**: a one-time welcome tour on first login, a tour on first visit of
  `/example`, a new sidebar entry "Guided tours".
- **Design system**: first app-level overlay written entirely in BUI; no new
  Material UI usage. Adds `marked` and `@braintree/sanitize-url` as direct
  dependencies of the react library (both already resolved in `yarn.lock`
  through `@backstage/ui`, so no new packages are installed).
- **Testing**: unit tests with `@backstage/frontend-test-utils`, one Playwright
  flow for a cross-page tour.
- **Out of scope**: backend-driven tour definitions, per-group targeting,
  analytics events, translations beyond the default English strings (strings
  are kept in one `translationRef` so they can be translated later).
