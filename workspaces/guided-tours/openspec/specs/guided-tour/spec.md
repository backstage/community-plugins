# guided-tour Specification

## Purpose

Guided tours for the Backstage new frontend system: plugins register tours
through an extension, steps spotlight elements and show markdown, progress
is saved per user, tours start on login or on the first visit of a route,
and a dedicated page lists and replays them.

## Requirements

### Requirement: Tours are registered through NFS extensions

The system SHALL expose a `GuidedTourBlueprint` (kind `guided-tour`) that attaches to the `tours` input of `api:guided-tour`, and `api:guided-tour` SHALL expose the collected tours as one list ordered by `order` then title.

#### Scenario: Plugin ships a tour

- **WHEN** a frontend plugin includes an extension made with `GuidedTourBlueprint` and the guided tour plugin is installed
- **THEN** the tour appears in `guidedTourApi.getTours()` with an id derived from the extension id (e.g. `example/intro`)

#### Scenario: Guided tour plugin not installed

- **WHEN** a plugin includes a `guided-tour` extension and the guided tour plugin is not part of the app
- **THEN** the app starts without error and the plugin behaves as if it shipped no tour

#### Scenario: Tour disabled by config

- **WHEN** `app.extensions` contains `guided-tour:example/intro: false`
- **THEN** the tour is absent from the list, the page, and auto-start

### Requirement: Steps spotlight an element and show markdown content

Each step SHALL highlight its target element with a dimmed mask and a cut-out and SHALL show title and content in a popover anchored to that element. Content SHALL support minimal markdown: paragraphs, bold, italic, inline code, links, bullet and numbered lists. HTML SHALL be rendered as text.

#### Scenario: Step with target

- **WHEN** a step with `target: 'catalog.create'` becomes active and an element with `data-guided-tour="catalog.create"` exists
- **THEN** the element is scrolled into view, the mask cuts it out, and the popover is positioned next to it with role `dialog` and the step title as accessible name

#### Scenario: Step without target

- **WHEN** a step has no `target`
- **THEN** the step is shown in a centered dialog without a cut-out

#### Scenario: Target never appears

- **WHEN** the target is not found within `targetTimeoutMs`
- **THEN** the step is shown centered when `onMissingTarget` is `center` (default), or skipped when it is `skip`

### Requirement: Navigation buttons

The popover SHALL show a Previous button (disabled on the first step), a Next button (labelled Done on the last step), a close control, and a `current / total` counter. Escape SHALL close the tour.

#### Scenario: Next and Previous

- **WHEN** the user presses Next on step 2 of 4
- **THEN** step 3 is shown; pressing Previous returns to step 2

#### Scenario: Done

- **WHEN** the user presses Done on the last step
- **THEN** the tour ends and its progress is saved as `completed`

### Requirement: Progress is saved per user

The system SHALL persist, through `storageApiRef` bucket `guided-tour`, for each tour: status (`in-progress`, `dismissed`, `completed`), current step index, tour version and timestamp.

#### Scenario: Next persists the step

- **WHEN** the user presses Next and then reloads the page
- **THEN** the tour resumes at the saved step

#### Scenario: Deep link while a tour is in progress

- **WHEN** a tour is saved as `in-progress` at a step with `route: '/'` and the user opens `/guided-tours` directly
- **THEN** the user stays on `/guided-tours`, no tour starts, and the tour's row offers Continue

#### Scenario: Dismiss is remembered

- **WHEN** the user closes a tour
- **THEN** the tour is saved as `dismissed` and is not auto-started again for that tour version

#### Scenario: Version bump re-shows

- **WHEN** a tour's `version` is higher than the saved version
- **THEN** the saved progress is ignored and the tour counts as never seen

### Requirement: Auto-start on login

Tours with `autoStart: 'login'` SHALL start automatically after the user's identity is resolved and storage is loaded, unless `api:guided-tour` config `autoStart` is `false`.

#### Scenario: First login

- **WHEN** a user with no saved tour progress and no `onboarded` flag signs in
- **THEN** all login tours without progress play one after another in `order`, and `onboarded` is written when the sequence finishes or is dismissed

#### Scenario: New tour after onboarding

- **WHEN** `onboarded` is set and a login tour without any progress entry exists (newly enabled plugin)
- **THEN** only that tour starts, on its own, not combined with previously seen tours

#### Scenario: Global kill switch

- **WHEN** `api:guided-tour` is configured with `autoStart: false`
- **THEN** no tour starts automatically; manual start and the page still work

### Requirement: Auto-start on first visit of a route

A tour with `autoStart: { route }` SHALL start the first time the location matches `route` for a user who has no progress entry for it, provided no other tour is running.

#### Scenario: First navigation to a plugin

- **WHEN** a user without progress for `example/intro` navigates to `/example`
- **THEN** `example/intro` starts

#### Scenario: Already seen

- **WHEN** the user has `completed` or `dismissed` progress for `example/intro` and navigates to `/example`
- **THEN** nothing starts

### Requirement: Manual start from any plugin

The `-react` library SHALL provide `useGuidedTour(id)` returning `{ available, start, progress }`; `start` SHALL be a no-op and `available` false when the guided tour plugin is not installed.

#### Scenario: Replay button in a plugin

- **WHEN** a plugin renders a button calling `useGuidedTour('example/intro').start({ force: true })`
- **THEN** the tour starts from step 1 regardless of saved progress

### Requirement: Dedicated page lists all tours

The system SHALL provide a page at `/guided-tours` (title "Guided tours") listing every registered tour with its status, a Start/Restart action per tour, and a Reset all action that clears all progress and the `onboarded` flag.

#### Scenario: Restart a completed tour

- **WHEN** the user presses Restart for a completed tour
- **THEN** the tour starts from step 1, navigating to the first step's `route` if set

#### Scenario: Reset all

- **WHEN** the user confirms Reset all
- **THEN** every tour shows status New and the next login replays the login sequence

### Requirement: Cross-page steps

A step MAY set `route` to navigate before being shown, and MAY set `advanceOn: 'click'` so that clicking the highlighted element advances the tour.

#### Scenario: Route step

- **WHEN** a step with `route: '/catalog'` becomes active while the user is on `/`
- **THEN** the app navigates to `/catalog` and waits for the step target before showing the popover

#### Scenario: Finishing a tour with a completeRoute

- **WHEN** a tour sets `completeRoute: '/'` and the user presses Done on its last step
- **THEN** the tour is saved as completed and the app navigates to `/`

#### Scenario: Click-through step keeps Next

- **WHEN** a step has `advanceOn: 'click'`
- **THEN** the popover shows the hint to click the element and still offers the Next button, which advances without the click

#### Scenario: Click-through step

- **WHEN** a step has `advanceOn: 'click'` and the user clicks the highlighted element
- **THEN** the click reaches the element, the tour advances, and if the click navigated, the next step waits for its target on the new page
