# Design: Guided tour plugin

## Context

- The app runs on the new frontend system (`@backstage/frontend-defaults`
  `createApp`, `app.packages: all`, `@backstage/frontend-plugin-api` 0.18).
- `@backstage/ui` 0.17 is installed and already provides `Popover` (a thin
  wrapper over `react-aria-components` `Popover` that forwards `triggerRef`,
  `placement`, `isOpen`, `isNonModal`), `Dialog`, `Button`, `ButtonIcon`,
  `Text`, `Link`, `Card`, `Table`, `Tooltip`, `VisuallyHidden`. It has no
  markdown component, but internally uses `marked`'s `Lexer` to turn inline
  markdown into `Link`/text (see its `Header`). We reuse that approach.
- App root elements (`AppRootElementBlueprint`) are rendered by
  `@backstage/plugin-app` _inside_ the router and the `BUIProvider`, before
  the routed content, and (when a sign-in page is configured) _outside_ the
  sign-in gate. So the overlay can use `useNavigate`/`useLocation`, but must
  wait for identity before doing anything.
- `storageApiRef` is implemented by `UserSettingsStorage` (user-settings
  backend, synced across tabs via signals). Without that module it degrades
  to `WebStorage` (localStorage); the tour plugin does not care which.
- Nav items are derived from `PageBlueprint` `title`/`icon` params and picked
  in `packages/app/src/modules/nav/Sidebar.tsx` via `nav.take('page:<id>')`.

## Goals

1. Any NFS plugin can ship tours by adding one extension and depending only
   on the `-react` library.
2. One global, ordered tour list owned by `api:guided-tour`.
3. Steps spotlight a DOM element and show markdown text in a popover with
   Previous / Next / Close.
4. Progress (current step, dismissed, completed) is saved per user.
5. Auto-start modes: on login, on first visit of a route, or manual only.
6. A tour that appears after the user has already been onboarded is played
   on its own, not merged into the welcome sequence.
7. `/guided-tours` page lists all tours, allows replay and reset.
8. Steps can change the route, or advance by the user clicking the
   highlighted element, so a tour can span pages.

## Non-goals

- No tour authoring UI, no backend storage of tour definitions.
- No support for the legacy frontend system (`createPlugin`).
- No Material UI in the new packages.

## Package layout

```
plugins/guided-tour-react/           @internal/backstage-plugin-guided-tour-react   (web-library)
  src/
    api.ts            guidedTourApiRef, GuidedTourApi, GuidedTourProgress, GuidedTourRunnerState
    types.ts          GuidedTour, GuidedTourStep, GuidedTourAutoStart
    blueprint.ts      GuidedTourBlueprint, guidedTourDataRef
    hooks/useGuidedTour.ts
    components/GuidedTourTarget.tsx    (optional wrapper that sets data-guided-tour)
    components/MarkdownText.tsx        (minimal markdown -> BUI elements)
    index.ts

plugins/guided-tour/                 @internal/backstage-plugin-guided-tour         (frontend-plugin, pluginId guided-tour)
  src/
    api/DefaultGuidedTourApi.ts       registry + runner state machine + progress store
    api/progressStore.ts              storageApi bucket helpers
    extensions/api.ts                 ApiBlueprint.makeWithOverrides -> api:guided-tour (input: tours)
    extensions/overlay.tsx            AppRootElementBlueprint -> app-root-element:guided-tour/overlay
    extensions/page.tsx               PageBlueprint -> page:guided-tour  (/guided-tours)
    components/overlay/GuidedTourOverlay.tsx      orchestration (identity gate, queue, route triggers)
    components/overlay/Spotlight.tsx              fixed SVG mask with cut-out
    components/overlay/StepPopover.tsx            BUI Popover + react-aria Dialog, buttons
    components/overlay/useTargetElement.ts        selector -> element, MutationObserver + timeout
    components/page/GuidedToursPage.tsx
    translation.ts
    plugin.ts, routes.ts, index.ts, alpha.ts
  dev/index.tsx                                   createDevApp-style playground with 2 demo tours

packages/app/src/modules/guided-tour/            welcome tour for this app
plugins/example/src/guidedTour.ts                 example.intro tour (route triggered)
```

## Public contract (`-react` library)

```ts
export interface GuidedTourStep {
  id: string; // unique inside the tour
  title?: string;
  content: string; // minimal markdown, see below
  /** Element to spotlight. A bare id resolves to `[data-guided-tour="<id>"]`;
   *  use `{ selector }` for an arbitrary CSS selector. Omit for a centered step. */
  target?: string | { selector: string };
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'; // react-aria Placement subset, default 'bottom'
  /** Navigate here (app-relative path) before the step is shown. */
  route?: string;
  /** 'next' (default): Next button. 'click': clicking the target advances; clicks pass through the mask. */
  advanceOn?: 'next' | 'click';
  /** How long to wait for the target to appear (lazy pages, navigation). Default 5000 ms. */
  targetTimeoutMs?: number;
  /** When the target never appears: 'center' (default) shows the step without spotlight, 'skip' jumps over it. */
  onMissingTarget?: 'center' | 'skip';
}

export type GuidedTourAutoStart =
  | false // manual only (default)
  | 'login' // part of onboarding / shown alone when new
  | { route: string }; // first time the location matches this path (matchPath semantics)

export interface GuidedTour {
  id: string; // defaults to the extension node id without the kind prefix, e.g. "example/intro"
  title: string;
  description?: string;
  version?: number; // bump to show the tour again to users who completed/dismissed an older version
  order?: number; // ordering in the queue and on the page, default 100
  autoStart?: GuidedTourAutoStart;
  steps: GuidedTourStep[];
}

export const guidedTourDataRef = createExtensionDataRef<GuidedTour>().with({
  id: 'guided-tour.tour',
});

export const GuidedTourBlueprint = createExtensionBlueprint({
  kind: 'guided-tour',
  attachTo: { id: 'api:guided-tour', input: 'tours' },
  output: [guidedTourDataRef],
  dataRefs: { tour: guidedTourDataRef },
  factory(params: Omit<GuidedTour, 'id'> & { id?: string }, { node }) {
    return [
      guidedTourDataRef({
        id: params.id ?? node.spec.id.replace(/^guided-tour:/, ''),
        ...params,
      }),
    ];
  },
});

export interface GuidedTourProgress {
  status: 'in-progress' | 'completed' | 'dismissed';
  stepIndex: number;
  version: number;
  updatedAt: string; // ISO
}

export interface GuidedTourRunnerState {
  activeTourId?: string;
  stepIndex: number;
  queue: string[]; // tours that will play after the active one
}

export interface GuidedTourApi {
  getTours(): GuidedTour[]; // global ordered list
  getTour(id: string): GuidedTour | undefined;
  start(id: string, opts?: { force?: boolean; stepId?: string }): void; // force ignores saved progress
  startQueue(ids: string[], opts?: { onboarding?: boolean }): void; // first starts, rest queued
  next(): void;
  previous(): void;
  dismiss(): void;
  complete(): void;
  isAutoStartEnabled(): boolean;
  getSnapshot(): GuidedTourSnapshot; // { ready, onboarded, state, progress }, immutable
  subscribe(listener: () => void): () => void; // for useSyncExternalStore
  getProgress(id: string): GuidedTourProgress | undefined; // undefined when version differs
  resetProgress(id: string): Promise<void>; // one tour
  resetAllProgress(): Promise<void>; // every tour + onboarded flag
  markOnboarded(): Promise<void>;
}
export const guidedTourApiRef = createApiRef<GuidedTourApi>({
  id: 'plugin.guided-tour.api',
});

/** Safe in any plugin: returns no-op handlers when the guided tour plugin is not installed. */
export function useGuidedTour(id: string): {
  available: boolean;
  start(opts?: { force?: boolean }): void;
  progress?: GuidedTourProgress;
};
```

The API exposes a snapshot plus `subscribe` instead of Observables so that
React consumers use `useSyncExternalStore` directly and tests need no
observable helpers.

Why the API and not the overlay owns the registry: tours must be queryable
by the page, by `useGuidedTour`, and by the overlay. `api:guided-tour` is
the single attachment point, created with
`ApiBlueprint.makeWithOverrides({ inputs: { tours: createExtensionInput([guidedTourDataRef]) }, configSchema: { autoStart: z => z.boolean().default(true) }, factory })`.
Extensions attached to an input of an extension that is not installed are
simply left unattached by the NFS app graph, which is what makes the
"ships a tour without the tour plugin" requirement free.

## Minimal markdown

`MarkdownText` lexes with `marked`'s `Lexer` (block + inline tokens) and
maps tokens to BUI elements. Supported: paragraphs, line breaks, `**bold**`,
`_italic_`, `` `code` ``, `[links](...)` (URLs through
`@braintree/sanitize-url`; app-relative links rendered with BUI `Link`, which
is router-aware), bullet and numbered lists. Headings render as
`Text` with a title variant. Everything else (HTML, images, tables) renders as
its raw text. No `dangerouslySetInnerHTML` anywhere.

## Runner behaviour

State machine in `DefaultGuidedTourApi` (framework-agnostic, observable):

```
idle --start(id)--> running{tour, stepIndex, queue}
running --next()--> stepIndex+1   | last step --> complete() --> pop queue or idle
running --previous()--> stepIndex-1 (min 0)
running --dismiss()--> progress[id] = dismissed --> pop queue or idle
```

Every transition writes progress:

| Event                               | Saved                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Next / Previous                     | `{ status: 'in-progress', stepIndex }` so a reload resumes at that step |
| Close / Esc / "Skip tour"           | `{ status: 'dismissed', stepIndex }`                                    |
| Next on last step                   | `{ status: 'completed', stepIndex: last }`                              |
| Start with `force` or from the page | overwrites previous status                                              |

Storage: `storageApi.forBucket('guided-tour')`, one key per tour
(`tour/<id>`) plus `onboarded: true` written when the login queue finishes
or is dismissed. One key per tour keeps writes small and lets the page
observe a single tour. `version` mismatch (tour bumped) is treated as "never
seen".

### Auto-start rules (evaluated once per page load, after identity resolves)

1. Wait for `identityApi.getBackstageIdentity()` and the first snapshot of
   the bucket (so a signed-out app or a loading storage shows nothing).
2. Skip everything if `api:guided-tour` config `autoStart` is `false`.
3. `loginTours = tours.filter(autoStart === 'login')` sorted by `order`.
4. If `onboarded` is not set: queue **all** `loginTours` without progress
   and play them back to back; each still has its own title, counter and
   progress. On finishing or dismissing the queue, write `onboarded`.
5. If `onboarded` is set: queue only `loginTours` that have **no** progress
   entry (new plugin enabled later, or bumped `version`). They are played
   alone, i.e. not re-attached to tours the user already handled.
6. Route tours: a `useLocation` effect matches `autoStart.route` against the
   pathname. First match with no progress entry and nothing running starts
   the tour. Matching tours while another tour runs wait for the next
   navigation, they do not interrupt.
7. Manual: `useGuidedTour(id).start()` or the page. `start` while a tour runs
   replaces it (the replaced tour is saved as `in-progress`).
8. Resume: before 4–6, a tour saved as `in-progress` resumes at its step,
   but only when that step has no `route` or its route matches the current
   page. A deep link is never redirected; the tours page shows "Continue"
   for such a tour instead.

### Steps, targets and cross-page flows

For the active step the overlay:

1. If `step.route` is set and differs from the current pathname, calls
   `navigate(step.route)`.
2. Resolves the target with `useTargetElement`: immediate `querySelector`,
   then a `MutationObserver` on `document.body` until found or
   `targetTimeoutMs` elapses. While waiting, a dimmed mask without hole and a
   small BUI `Skeleton` card is shown so the user sees something happened.
3. On found: `scrollIntoView({ block: 'center', inline: 'nearest' })`, then
   measure `getBoundingClientRect()`; re-measure on `ResizeObserver`,
   `scroll` (capture) and `resize`, throttled to animation frames.
4. On timeout: `onMissingTarget` decides between centered `Dialog` and skip.
5. `advanceOn: 'click'`: the mask hole has `pointer-events: none`, a
   capture-phase `click` listener on the target calls `next()`. If the click
   navigates, the next step's `useTargetElement` waits for the new page. The
   popover keeps its Next button in this mode (it advances without the
   click) and adds the hint "Click the highlighted element to continue".

Spotlight = `position: fixed; inset: 0` SVG with a `fill-rule="evenodd"`
path (full rect minus rounded target rect, padding 6px). Mask rects are
`pointer-events: auto` except the hole. z-index sits below BUI's Popover
portal so the card is always on top. Colors come from BUI tokens
(`--bui-bg-overlay`-like neutrals), so dark theme is free.

Step card = BUI `Popover` (`triggerRef={{ current: targetElement }}`,
`isNonModal`, `isOpen`, `placement`, `shouldFlip`) wrapping a
`react-aria-components` `Dialog` for `role="dialog"` and focus handling.
Escape is handled by the overlay itself with a capturing `keydown`
listener; the popover's `onOpenChange` is deliberately ignored because
react-aria also reports "closed" when focus leaves the popover, which
happens for a moment on every step change. Contents: `Text` title, `MarkdownText`
body, footer `Flex` with step counter `n / total`, `Button variant="secondary"` Previous
(disabled on first step), `Button variant="primary"` Next / Done, and a
`ButtonIcon` close in the header. Steps without a target reuse the same
card inside BUI `Dialog` (modal, centered).

The overlay renders nothing at all when there is no active tour, so it costs
nothing on normal pages.

### Guided tours page (`/guided-tours`)

`PageBlueprint` with `title: 'Guided tours'`, icon, lazy loader. BUI `Table`
(or `Card` list on narrow screens) with columns Title, Description, Steps,
Status (New / In progress / Completed / Dismissed with BUI `Badge`), and
actions Start / Restart. Header actions: "Reset all tours" (confirm with BUI
`Dialog`, then `resetAllProgress()`), and a note explaining auto-start.
Starting a tour from the page navigates to the first step's `route` if set.
Sidebar: `nav.take('page:guided-tour')` inside the Settings group.

## Configuration

```yaml
app:
  extensions:
    - guided-tour:example/intro: false # disable one tour
    - api:guided-tour:
        config:
          autoStart: false # never auto-start (e2e, kiosks)
```

## Testing

- `-react`: `MarkdownText` snapshot tests; blueprint test with
  `createExtensionTester` asserting the `guided-tour.tour` output and derived id.
- plugin: `DefaultGuidedTourApi` state machine with `MockStorageApi`
  (auto-start rules 4–6 as table tests); `useTargetElement` with jsdom
  `MutationObserver`; overlay rendered via `renderInTestApp` with a fake
  identity; page rendered with a stubbed api.
- app: Playwright test in `packages/app/e2e-tests` that logs in as guest,
  walks the welcome tour across `/catalog` and `/settings`, reloads mid-tour
  and expects to resume at the saved step.

## Risks and mitigations

- **Root elements render before sign-in** → identity gate in the overlay.
- **Lazy pages / portals**: targets appear late → MutationObserver + timeout
  - `onMissingTarget`.
- **Legacy MUI sidebar** is not BUI: targeting uses `data-guided-tour`
  attributes, so the welcome tour adds that attribute to `SidebarItem`s via
  the existing `nav.withComponent` hook; no MUI dependency in the plugin.
- **Storage write races** (Next clicked fast): writes are serialized per key
  in `progressStore`; the in-memory runner state is the source of truth
  while running.
- **Two tabs**: `UserSettingsStorage` emits updates via signals; the runner
  ignores remote updates while a tour is active and re-reads them when idle.
- **Selector drift** when plugins change markup: targets are ids on a data
  attribute, not DOM paths; `onMissingTarget: 'skip'` keeps tours resilient.

## Alternatives considered

- _react-joyride / driver.js_: own CSS and overlay stack, MUI-era styling,
  no portal awareness of BUI; rejected to keep one design system.
- _Tour registry in the overlay element instead of the API_: would force
  every consumer to go through React context; rejected because the page and
  the hook need the list without being descendants of the overlay.
- _One `tours` storage key_: simpler, but every Next rewrites every tour and
  the page cannot observe one tour; rejected.
- _A user-settings tab instead of a page_: the user asked for a dedicated
  page; a settings tab can be added later with the same component.

## Open questions

1. Should a dismissed login tour be re-offered after N days, or only after
   a `version` bump? Proposal: only on version bump; the page is the way back.
2. Should the "Reset all" action also clear `onboarded` so the full welcome
   sequence replays on next login? Proposal: yes, that is what users expect
   from "show all guided tours again".
