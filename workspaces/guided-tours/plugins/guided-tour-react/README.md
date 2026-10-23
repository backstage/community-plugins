# @internal/backstage-plugin-guided-tour-react

Ship a guided tour from any Backstage frontend plugin (new frontend system).
This package only holds the contract: the `GuidedTourBlueprint`, the
`guidedTourApiRef`, the `useGuidedTour` hook and a tiny markdown renderer.
The engine lives in `@internal/backstage-plugin-guided-tour`; when that
plugin is not installed, your tour extension stays unattached and nothing
breaks.

## Ship a tour

```ts
import { GuidedTourBlueprint } from '@internal/backstage-plugin-guided-tour-react';

export const introTour = GuidedTourBlueprint.make({
  name: 'intro',
  params: {
    title: 'Welcome to Example',
    description: 'A two minute walk through the example plugin.',
    autoStart: { route: '/example' }, // first visit of /example
    steps: [
      {
        id: 'todos',
        target: 'example.todos',
        content: 'These are your **todos**.',
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

Add it to your plugin's `extensions` and mark the targets in your UI:

```tsx
<div {...guidedTourTargetProps('example.todos')}>...</div>
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
