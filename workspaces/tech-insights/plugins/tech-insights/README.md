# Tech Insights

This plugin provides the UI for the `@backstage/tech-insights-backend` plugin, in order to display results of the checks running following the rules and the logic defined in the `@backstage/tech-insights-backend` plugin itself.

Main areas covered by this plugin currently are:

- Providing an overview for default boolean checks in a form of Scorecards.

- Providing an option to render different custom components based on type of the checks running in the backend.

## Installation

### Install the plugin

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-tech-insights
```

### Add boolean checks overview (Scorecards) page to the EntityPage:

```tsx
// packages/app/src/components/catalog/EntityPage.tsx

import { EntityTechInsightsScorecardContent } from '@backstage-community/plugin-tech-insights';

const serviceEntityPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>
    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>
    ...
    <EntityLayout.Route path="/tech-insights" title="Scorecards">
      <EntityTechInsightsScorecardContent
        title="Customized title for the scorecard"
        description="Small description about scorecards"
      />
    </EntityLayout.Route>
    ...
  </EntityLayoutWrapper>
);
```

It is obligatory to pass `title` prop to `EntityTechInsightsScorecardContent`, `description` prop is optional.

If you like to display multiple cards in a `EntityLayout.Route` use `EntityTechInsightsScorecardCard`.

You can pass an array `checksId` as a prop with the [Fact Retrievers ids](../tech-insights-backend#creating-fact-retrievers) to limit which checks you want to show in this card. If you don't pass, the default value is show all checks.

```tsx
<EntityTechInsightsScorecardContent
  title="Show only simpleTestCheck in this card"
  checksId={['simpleTestCheck']}
/>
```

If you want to show checks in the overview of an entity use `EntityTechInsightsScorecardCard`.

```tsx
// packages/app/src/components/catalog/EntityPage.tsx

import { EntityTechInsightsScorecardCard } from '@backstage-community/plugin-tech-insights';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6} xs={12}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={6} xs={12}>
      <EntityCatalogGraphCard variant="gridItem" height={400} />
    </Grid>
    ...
    <Grid item md={8} xs={12}>
      <EntityTechInsightsScorecardCard
        title="Customized title for the scorecard"
        description="Small description about scorecards"
        checksId={['simpleTestCheck']}
      />
    </Grid>
  </Grid>
);
```

## Boolean Scorecard Example

If you follow the [Backend Example](../tech-insights-backend#backend-example), once the needed facts have been generated the default boolean scorecard will look like this:

![Boolean Scorecard Example](./docs/boolean-scorecard-example.png)

## Adding custom rendering components

Default scorecard implementation displays only `json-rules-engine` check results. If you would like to support different types, you need to inject custom rendering components to the `TechInsightsClient` constructor.

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

export const myCustomBooleanRenderer: CheckResultRenderer = {
  type: 'boolean',
  component: (checkResult: CheckResult) => (
    <BooleanCheck checkResult={checkResult} />
  ),
};
```

It's also possible to customize the description. Both strings and React components are accepted. As an example, you would like
to display another information if the check has failed. In such cases, you could do something like the following:

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

### Add overview (Scorecards) page:

![Scorecard Overview](./docs/scorecard-overview.png)

First make the Scorecard page available as route

```tsx
// packages/app/src/App.tsx

import { TechInsightsScorecardPage } from '@backstage-community/plugin-tech-insights';

const routes = (
  <FlatRoutes>
    ...
    <Route path="/tech-insights" element={<TechInsightsScorecardPage />} />
  </FlatRoutes>
);
```

Then add it to the navigation menu

```tsx
// packages/app/src/components/Root/Root.tsx

import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';

export const Root = ({ children }: PropsWithChildren<{}>) => (
  ...
  <SidebarItem icon={EmojiObjectsIcon} to="tech-insights" text="Tech insight" />
  ...
);
```

## Custom views rendering tech-insights results

If you create a custom view which renders tech-insights results, you can use the `TechInsightsCheckIcon`, which also (by default) is clickable and opens a popup menu with links for this particular check and entity.

You can also render the icon using the tech-insights renderer or pass the `disableLinksMenu` prop to `TechInsightsCheckIcon` to disable the menu, and render it elsewhere, by importing `TechInsightsLinksMenu`.

### Render the check icon with a popup menu for links

```tsx
import { TechInsightsCheckIcon } from '@backstage-community/plugin-tech-insights';

export const MyComponent = () => {
  const entity = getEntitySomehow();
  const result = getCheckResultSomehow();

  return <TechInsightsCheckIcon result={result} entity={entity} />;
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
