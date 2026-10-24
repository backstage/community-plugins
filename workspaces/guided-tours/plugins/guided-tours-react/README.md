# Guided Tours React Package for Plugin Authors

Ship a guided tour from any Backstage frontend plugin (new frontend system).
This package only holds the contract: the `GuidedTourBlueprint`, the
`guidedTourApiRef`, the `useGuidedTour` hook and a tiny markdown renderer.
The engine lives in `@backstage-community/plugin-guided-tours`; when that
plugin is not installed, your tour extension stays unattached and nothing
breaks.

![Anchored step with spotlight (light)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/anchored-light.png)

More screenshots, including the dark theme and the overview page, are in the
[workspace README](https://github.com/backstage/community-plugins/tree/main/workspaces/guided-tours#readme).

## Installation

```sh
yarn --cwd plugins/<your-plugin> add @backstage-community/plugin-guided-tours-react
```

The app also needs
[`@backstage-community/plugin-guided-tours`](https://github.com/backstage/community-plugins/tree/main/workspaces/guided-tours/plugins/guided-tours#readme)
installed, see its README.

## Ship a tour

```ts
import { GuidedTourBlueprint } from '@backstage-community/plugin-guided-tours-react';

export const introTour = GuidedTourBlueprint.make({
  // in the plugin "example": extension guided-tour:example/intro, tour id example/intro
  name: 'intro',
  params: {
    title: 'Welcome to Example',
    description: 'A two minute walk through the example plugin.',
    autoStart: { path: '/example' }, // first visit of /example (exact: false for subpages too)
    steps: [
      {
        id: 'todos',
        // looks up [data-guided-tour="example.todos"], see guidedTourTargetProps below
        target: 'example.todos',
        content: 'These are your **todos**.',
      },
      {
        id: 'search',
        // any CSS selector, e.g. for elements of other plugins
        target: { selector: 'input[name="search"]' },
        content: 'Filter the list here.',
      },
      {
        id: 'go',
        target: 'example.catalog-link',
        advanceOn: 'click',
        content: 'Click here to continue.',
      },
      {
        id: 'done',
        content: 'Done! Open [all tours](/guided-tours) any time.',
      },
    ],
  },
});
```

### Translated texts

The tour title and description and the step titles and contents can also
come from a translation ref through `translated(ref, key)`. The key is
checked against the ref's messages at compile time, and only `translated`
can create such a text:

```ts
{
  id: 'done',
  title: translated(exampleTranslationRef, 'tour.done.title'),
  content: translated(exampleTranslationRef, 'tour.done.content'),
}
```

`useGuidedTourText(text)` resolves such a text in your own components.

### Custom components as content

A step's content can also be a React element loaded on demand, like the
`loader` of `PageBlueprint`; the chunk is fetched when the step is shown:

```tsx
{
  id: 'hint',
  target: 'example.todos',
  content: { loader: () => import('./TourHint').then(m => <m.TourHint />) },
}
```

### Mark the targets

Add it to your plugin's `extensions` and mark the targets in your UI. A
string target is resolved to the element with the matching
`data-guided-tour` attribute, which `guidedTourTargetProps` creates:

```tsx
<div {...guidedTourTargetProps('example.todos')}>...</div>
```

The [tours of the dev app](https://github.com/backstage/community-plugins/tree/main/workspaces/guided-tours/plugins/guided-tours/dev/tours) are complete
examples of login tours, page tours, click-through steps, translated texts
and lazily loaded content.

## Add a "restart tour" button to your plugin header

```tsx
PluginHeaderActionBlueprint.make({
  name: 'restart-tour',
  params: {
    loader: () =>
      import('@backstage-community/plugin-guided-tours-react').then(m => (
        <m.RestartTourAction tourId="example/intro" />
      )),
  },
});
```

## Start a tour from code

```tsx
const { available, start } = useGuidedTour('example/intro');
{
  available && (
    <Button onPress={() => start({ force: true })}>Replay tour</Button>
  );
}
```
