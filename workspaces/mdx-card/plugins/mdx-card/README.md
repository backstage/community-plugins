# MDX Card

Render cards on entity pages and the home page from [MDX](https://mdxjs.com/) templates. A template is Markdown mixed with JSX. It can show JSON responses from any Backstage backend plugin using tables, charts and Backstage UI components, without you writing a new plugin.

![MDX card on an entity page, showing data from the catalog backend in a metadata table and a table of entities with the same owner](./docs/entity-card.png)

![MDX card on the home page, showing a pie chart of catalog entities by kind](./docs/home-page-widget.png)

## Installation

```sh
yarn --cwd packages/app add @backstage-community/plugin-mdx-card
```

The plugin is built with [Backstage UI](https://ui.backstage.io/). Apps created with recent versions of Backstage already import its stylesheet in `packages/app/src/index.tsx`. If yours doesn't, add:

```ts
import '@backstage/ui/css/styles.css';
```

## New frontend system

Once the package is installed, the plugin is discovered automatically. Both extensions are disabled by default. Enable and configure them in `app-config.yaml`:

```yaml
app:
  extensions:
    - entity-card:mdx-card:
        config:
          title: Entity summary
          filter: kind:component
          dataFetchers:
            - name: details
              pluginId: catalog
              apiUrl: /entities/by-name/{{ entity.kind }}/{{ entity.metadata.namespace }}/{{ entity.metadata.name }}
            - name: sameOwner
              pluginId: catalog
              apiUrl: /entities/by-query?filter=spec.owner={{ entity.spec.owner }}&limit=10
          template: |
            **{props.details.metadata.name}** is a {props.details.spec.type} owned by <EntityRefLink entityRef={props.details.spec.owner} defaultKind="group" />.

            <MetadataTable
              metadata={{
                lifecycle: props.details.spec.lifecycle,
                system: props.details.spec.system,
                relations: props.details.relations.length,
              }}
            />

            #### Owned by {props.details.spec.owner}

            <DataTable
              label="Entities with the same owner"
              columns={[{ title: 'Kind', field: 'kind' }, { title: 'Name', field: 'name' }]}
              data={props.sameOwner.items.map(e => ({ kind: e.kind, name: e.metadata.name }))}
            />
    - home-page-widget:mdx-card:
        config:
          title: Latest entities
          dataFetchers:
            - name: entities
              pluginId: catalog
              apiUrl: /entities/by-query?limit=5
          template: |
            <DataTable
              columns={[{ title: 'Name', field: 'name' }, { title: 'Kind', field: 'kind' }]}
              data={props.entities.items.map(e => ({ name: e.metadata.name, kind: e.kind }))}
            />
```

The entity card accepts the standard `filter` and `type` options from `EntityCardBlueprint`. The example above produces the card in the first screenshot.

To add more than one MDX card, create your own extensions using the exported components:

```tsx
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

const deploymentsCard = EntityCardBlueprint.make({
  name: 'deployments',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('@backstage-community/plugin-mdx-card').then(m => (
        <m.EntityMdxCard title="Deployments" template={deploymentsTemplate} />
      )),
  },
});

export default createFrontendModule({
  pluginId: 'app',
  extensions: [deploymentsCard],
});
```

## Legacy frontend system

Add the entity card to `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityMdxCard } from '@backstage-community/plugin-mdx-card/legacy';

<Grid item md={6}>
  <EntityMdxCard
    title="Ownership"
    template={`This {props.entity.kind} is owned by <EntityRefLink entityRef={props.entity.spec.owner} defaultKind="group" />.`}
  />
</Grid>;
```

Add the home page card to your home page:

```tsx
import { HomePageMdxCard } from '@backstage-community/plugin-mdx-card/legacy';

<HomePageMdxCard
  title="Latest entities"
  dataFetchers={[
    {
      name: 'entities',
      pluginId: 'catalog',
      apiUrl: '/entities/by-query?limit=5',
    },
  ]}
  template="Showing {props.entities.items.length} of {props.entities.totalItems} entities."
/>;
```

## Stored templates and the editor

Instead of writing templates in config or code, you can store them with the MDX card backend and edit them in the browser. The editor page lists stored templates and shows a live preview while you edit. The preview can use a catalog entity, so you can build entity page cards against real data.

![Editor page listing stored MDX cards](./docs/editor-list.png)

![Editor with data fetchers and an MDX template on the left, and a live preview for a selected entity on the right](./docs/editor.png)

1. Install and set up `@backstage-community/plugin-mdx-card-backend`. See its [README](../mdx-card-backend/README.md).
2. Enable the editor page. In the new frontend system:

   ```yaml
   app:
     extensions:
       - page:mdx-card: true
   ```

   The page is mounted at `/mdx-cards` and appears in the sidebar. In the legacy frontend system, add a route in `packages/app/src/App.tsx`:

   ```tsx
   import { MdxCardEditorPage } from '@backstage-community/plugin-mdx-card/legacy';

   <Route path="/mdx-cards" element={<MdxCardEditorPage />} />;
   ```

3. Reference a stored template from a card with `templateRef` instead of `template`:

   ```yaml
   app:
     extensions:
       - entity-card:mdx-card:
           config:
             templateRef: ownership
   ```

   ```tsx
   <EntityMdxCard templateRef="ownership" />
   ```

The card uses the stored template and its data fetchers. Data fetchers set on the card are added to them, and replace stored ones with the same `name`. If a card sets both `template` and `templateRef`, `template` wins.

## Templates

Templates are compiled with `@mdx-js/mdx` and support [GitHub Flavored Markdown](https://github.github.com/gfm/). Inside a template, `props` contains:

| Property              | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `props.user`          | The signed-in user: `profile`, `identity` (`userEntityRef`, `ownershipEntityRefs`) and `displayName` |
| `props.entity`        | The current entity. Only available on entity pages                                                   |
| `props.<fetcherName>` | The JSON response of the data fetcher with that `name`                                               |

### Writing templates

Templates are Markdown with JSX. Plain text and Markdown work as usual, and JSX expressions in `{}` can use `props`. Use `Flex` and `Grid` to lay out components, and `Text` for styled text:

```mdx
<Flex direction="column" gap="3">
  <Flex gap="2" align="center">
    <Text variant="title-small">{props.entity.metadata.title ?? props.entity.metadata.name}</Text>
    <Badge>{props.entity.spec.lifecycle}</Badge>
  </Flex>

  <Grid.Root columns="2" gap="4">
    <Flex direction="column" gap="1">
      <Text color="secondary">Owner</Text>
      <EntityRefLink entityRef={props.entity.spec.owner} defaultKind="group" />
    </Flex>
    <Flex direction="column" gap="1">
      <Text color="secondary">Tags</Text>
      <Text>{(props.entity.metadata.tags ?? []).join(', ') || 'None'}</Text>
    </Flex>
  </Grid.Root>
</Flex>
```

If a template fails to compile or throws while rendering, the card shows the error message instead of its content. Guard against missing data with optional chaining and defaults, for example `props.entity.metadata.tags ?? []`.

### Available components

Templates can use these components from [Backstage UI](https://ui.backstage.io/) (`@backstage/ui`). See its documentation for their props:

| Group    | Components                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Layout   | `Box`, `Container`, `Flex`, `Grid` (as `Grid.Root` and `Grid.Item`), `Card`, `CardHeader`, `CardBody`, `CardFooter` |
| Content  | `Text`, `Link`, `Avatar`, `Badge`, `Tag`, `TagGroup`, `Tooltip`, `TooltipTrigger`, `Alert`, `Skeleton`              |
| Actions  | `Button`, `ButtonIcon`, `ButtonLink`                                                                                |
| Grouping | `Accordion`, `AccordionGroup`, `AccordionTrigger`, `AccordionPanel`, `Tabs`, `TabList`, `Tab`, `TabPanel`           |
| Lists    | `List`, `ListRow`, `TableRoot`, `TableHeader`, `TableBody`, `Column`, `Row`, `Cell`, `CellText`, `CellProfile`      |

And these components from this plugin:

| Component                                           | Description                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DataTable`                                         | Table from `columns` (`{ title, field }` items) and `data` (an array of objects)                                                                             |
| `MetadataTable`                                     | Key and value list from a `metadata` object                                                                                                                  |
| `EntityRefLink`                                     | Link to the entity page of `entityRef`, showing the entity's display name or `title`. Set `defaultKind` for refs without a kind, such as `spec.owner` values |
| `EntityRefLinks`                                    | Comma separated links for an `entityRefs` array. Accepts `defaultKind` too                                                                                   |
| `AreaChart`, `BarChart`, `LineChart`, `PieChart`    | Charts built on [Recharts](https://recharts.org/)                                                                                                            |
| `ApiFetcher`, `ApiFetcherContent`, `ApiFetcherData` | Fetch data while the template renders                                                                                                                        |

`BarChart`, `LineChart` and `AreaChart` take `data`, `xKey` and `yKeys`. `PieChart` takes `data` as `{ name, value }` items. All charts accept `height`, `width`, `colors`, `showLegend` and `showTooltip`.

Pass the `components` prop to `EntityMdxCard`, `HomePageMdxCard` or `MdxCardContent` to make more components available. They are merged with `defaultMdxComponents`.

### Data fetchers

Each data fetcher calls a backend plugin through the discovery API and the fetch API, so requests carry the user's Backstage token.

| Field      | Description                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | Property the response is exposed under in `props`                                                                                                     |
| `pluginId` | Backend plugin ID, e.g. `catalog`, `proxy` or `tech-insights`                                                                                         |
| `apiUrl`   | Path relative to the plugin base URL. Supports [Nunjucks](https://mozilla.github.io/nunjucks/) expressions with `entity`, `user` and `now()` in scope |

Responses must be JSON. When a request fails or returns another content type, the property holds `{ error: string }` instead, so templates can show the problem.

### Fetching data from within the template

`ApiFetcher` loads data while the template renders. Its `url` is relative to `backend.baseUrl`:

```mdx
<ApiFetcher url="/api/catalog/entities/by-query?limit=1">
  <ApiFetcherContent>
    <ApiFetcherData
      path="items.0.metadata.name"
      render={name => <Badge>{name}</Badge>}
    />
  </ApiFetcherContent>
</ApiFetcher>
```

`ApiFetcher` also accepts a function as its child, which receives `{ data, loading, error }`.

## Security

MDX templates are compiled and run as JavaScript in the user's browser. Only let trusted administrators write templates, for example by keeping them in source control or app config. Never build templates from user input.

Stored templates are protected by the `mdx-card.template.create`, `mdx-card.template.update` and `mdx-card.template.delete` permissions. Anyone allowed to create or update templates can run JavaScript in the browsers of everyone who views their cards, so restrict these permissions to trusted users in your permission policy. If the permission framework is disabled, every signed-in user can edit templates.
