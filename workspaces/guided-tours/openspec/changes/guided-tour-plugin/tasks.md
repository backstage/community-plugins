# Tasks: Guided tour plugin

## 1. `plugins/guided-tour-react` (web library)

- [ ] 1.1 Scaffold `@internal/backstage-plugin-guided-tour-react` with `backstage-cli new` (role `web-library`); deps: `@backstage/frontend-plugin-api`, `@backstage/ui`, `marked`, `@braintree/sanitize-url`; peer `react`, `react-router-dom`.
- [ ] 1.2 Add `types.ts` (`GuidedTour`, `GuidedTourStep`, `GuidedTourAutoStart`) and `api.ts` (`GuidedTourApi`, `GuidedTourProgress`, `GuidedTourRunnerState`, `guidedTourApiRef`).
- [ ] 1.3 Add `guidedTourDataRef` and `GuidedTourBlueprint` (kind `guided-tour`, attachTo `api:guided-tour` / `tours`, id derived from node id).
- [ ] 1.4 Add `useGuidedTour(id)` hook using `useApiHolder()` so it is a no-op without the plugin.
- [ ] 1.5 Add `MarkdownText` (marked `Lexer` → BUI `Text`/`Link`/lists/code, sanitized links) with tests.
- [ ] 1.6 Add `GuidedTourTarget` helper (`data-guided-tour` attribute) and `guidedTourTargetProps(id)`.
- [ ] 1.7 Export everything from `index.ts`, write `README.md` with the "ship a tour from your plugin" recipe, run `yarn tsc && yarn lint && yarn test` for the package.

## 2. `plugins/guided-tour` core

- [ ] 2.1 Scaffold `@internal/backstage-plugin-guided-tour` (role `frontend-plugin`, pluginId `guided-tour`); deps: `-react` lib, `@backstage/frontend-plugin-api`, `@backstage/ui`, `react-aria-components`, `react-router-dom`.
- [ ] 2.2 Implement `progressStore.ts` over `storageApiRef.forBucket('guided-tour')` (per-tour keys, `onboarded`, serialized writes, `observe$`).
- [ ] 2.3 Implement `DefaultGuidedTourApi` (registry sorted by `order`, runner state machine, `state$`, `progress$`, `resetProgress`), with table-driven unit tests using `MockStorageApi`.
- [ ] 2.4 Add `api:guided-tour` via `ApiBlueprint.makeWithOverrides` with `tours` input and `autoStart` config schema.
- [ ] 2.5 Add `translation.ts` with all user-facing strings.

## 3. Overlay (app root element)

- [ ] 3.1 `useTargetElement` (selector resolution, MutationObserver, timeout, rect tracking) with jsdom tests.
- [ ] 3.2 `Spotlight` SVG mask with evenodd hole, pointer-events rules for `advanceOn: 'click'`.
- [ ] 3.3 `StepPopover` on BUI `Popover` + react-aria `Dialog` (title, `MarkdownText`, counter, Previous / Next / Done / close, Esc = dismiss, keyboard focus). Centered BUI `Dialog` variant for target-less steps.
- [ ] 3.4 `GuidedTourOverlay`: identity gate, storage-ready gate, login queue and `onboarded` logic, route-triggered tours, `step.route` navigation, click-to-advance wiring, no render when idle.
- [ ] 3.5 Register `app-root-element:guided-tour/overlay` with `AppRootElementBlueprint`; render tests via `renderInTestApp`.

## 4. Guided tours page

- [ ] 4.1 `GuidedToursPage` (BUI `Table`/`Card`, status `Badge`, Start / Restart, Reset all with confirm `Dialog`).
- [ ] 4.2 Register `page:guided-tour` (`/guided-tours`, title "Guided tours", icon) and `rootRouteRef`.
- [ ] 4.3 Dev app under `plugins/guided-tour/dev` with two demo tours (one route-triggered, one with a click step).

## 5. App wiring and demo tours

- [ ] 5.1 Add both packages to `packages/app/package.json`; add `nav.take('page:guided-tour')` to the Settings group in `Sidebar.tsx`; add `data-guided-tour` ids to sidebar items via `nav.withComponent`.
- [ ] 5.2 Add `packages/app/src/modules/guided-tour` with the `app/welcome` login tour (sidebar → `/catalog` → create button → `/settings`) and register it in `App.tsx`.
- [ ] 5.3 Add `guided-tour:example/intro` to `plugins/example` (route `/example`, one `advanceOn: 'click'` step), depending only on the `-react` package; mark targets in `TodoPage`.
- [ ] 5.4 Document `app.extensions` toggles and `autoStart: false` in `app-config.yaml` comments and `plugins/guided-tour/README.md`.

## 6. Verification

- [ ] 6.1 `yarn tsc`, `yarn lint:all`, `yarn prettier:check`, `yarn test:all` green.
- [ ] 6.2 Playwright e2e: welcome tour across pages, reload resumes saved step, dismiss is remembered, Reset all replays.
- [ ] 6.3 Manual check in light and dark theme, keyboard-only navigation, screen reader announces step title.
