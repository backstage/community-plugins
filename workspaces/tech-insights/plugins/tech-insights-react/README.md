# @backstage-community/plugin-tech-insights-react

The tech-insights web library contains reusable frontend components and a reference implementation for the tech-insights api.

## Rendering custom tech insights views

If you create a custom view which renders tech-insights results, you can use the `ResultCheckIcon`, which also (by default) is clickable and opens a popup menu with links for this particular check and entity.

You can also render the icon using the tech-insights renderer or pass the `disableLinksMenu` prop to `ResultCheckIcon` to disable the menu, and render it elsewhere, by importing `ResultLinksMenu`.

### Render the check icon with a popup menu for links

```tsx
import { ResultCheckIcon } from '@backstage-community/plugin-tech-insights-react';

export const MyComponent = () => {
  const entity = getEntitySomehow();
  const result = getCheckResultSomehow();

  return <ResultCheckIcon result={result} entity={entity} />;
};
```

### Render the popup menu for links

You can render a custom component (like a button) which opens the popup menu with links.

The menu will be anchored to an element, likely the button being pressed, or icon being clicked. The `setMenu` prop is used to get a function to open the menu.

```tsx
import {
  TechInsightsLinksMenu,
  ResultLinksMenuInfo,
} from '@backstage-community/plugin-tech-insights';

export const MyComponent = () => {
  const entity = getEntitySomehow();
  const result = getCheckResultSomehow();

  const [menu, setMenu] = useState<ResultLinksMenuInfo | undefined>();

  return (
    <>
      <Button
        title="Show links"
        disabled={!menu}
        onClick={event => menu?.open(event.currentTarget)}
      />
      <TechInsightsLinksMenu
        result={result}
        entity={entity}
        setMenu={setMenu}
      />
    </>
  );
};
```

### Adding custom rendering components

Default implementation displays only `json-rules-engine` check results. If you would like to support different types, you need to inject custom rendering components to the `TechInsightsClient` constructor.

```ts
// packages/app/src/apis.ts

export const apis: AnyApiFactory[] = [
...
  createApiFactory({
    api: techInsightsApiRef,
    deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
    factory: ({ discoveryApi, identityApi }) =>
      new TechInsightsClient({
        discoveryApi,
        identityApi,
        renderers: [
          jsonRulesEngineCheckResultRenderer, // default json-rules-engine renderer
          myCustomBooleanRenderer, // custom renderer
        ],
      }),
  }),
...
];
```

```tsx
// packages/app/src/components/myCustomBooleanRenderer.tsx
import { BooleanCheck } from '@backstage-community/plugin-tech-insights-react';
...

export const myCustomBooleanRenderer: CheckResultRenderer = {
  type: 'boolean',
  component: (checkResult: CheckResult) => (
    <BooleanCheck checkResult={checkResult} />
  ),
};
```

### Customizing the description

It's possible to customize the description with either a string or a React component. For example, displaying additional information if the check has failed.

```tsx
// packages/app/src/components/myCustomBooleanRenderer.tsx

export const myCustomBooleanRenderer: CheckResultRenderer = {
  type: 'boolean',
  component: (checkResult: CheckResult) => (
    <BooleanCheck checkResult={checkResult} />
  ),
  description: (checkResult: CheckResult) => (
    <>
      {
        checkResult.result
          ? checkResult.check.description // In case of success, return the same description
          : `The check has failed! ${checkResult.check.description}` // Add a prefix text if the check failed
      }
    </>
  ),
};
```
