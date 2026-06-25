# GitHub Issues plugin

Welcome to the GitHub Issues plugin!

> [!Note]
> Backstage UI (BUI) is now required for the GitHub Issues plugin to function, BUI has been included as part of Backstage since `1.41.0` which means you're very likely to already have it installed. The [BUI documentation](https://ui.backstage.io/) has details on installation if needed and the Backstage [User Interface documentation](https://backstage.io/docs/conf/user-interface/) has details on creating a custom BUI theme.

Based on the [well-known GitHub slug annotation](https://backstage.io/docs/features/software-catalog/well-known-annotations#githubcomproject-slug) associated with the Entity, it renders the list of Open issues in GitHub.
The plugin will attempt to determine the source code location using the [well-known Source location slug annotation](https://backstage.io/docs/features/software-catalog/well-known-annotations/#backstageiosource-location) or [Managed by location slug annotation](https://backstage.io/docs/features/software-catalog/well-known-annotations/#backstageiomanaged-by-location) associated with the Entity.
If no configured Github provider will match, the first one will be used.

The plugin is designed to work with any Entity kind, and it behaves a bit differently depending on the target kind:

- Kind: Group/User: the plugin renders issues from all repositories for which the Entity is the owner.
- Kind: Component: the plugin renders all issues related to the entity as a page and as a card (can be customized by filter, see below)
- All other kinds by default show a card. If needed, target kinds can be filtered using the following configuration:

```yaml
app:
  extensions:
    - entity-card:github-issues/overview:
      config:
        filter:
          kind:
            $in:
              - component
              - system
              - resource
              - group
              - user
```

**Issues are sorted from the recently updated DESC order (the plugin might not render all issues from a single repo next to each other).**

## Screenshots

### Card View

![GitHub Issues Card](docs/github-issues-card.png)

### Tab View

![GitHub Issues Tab](docs/github-issues-tab.png)

## Prerequisites

- [GitHub Authentication Provider](https://backstage.io/docs/auth/github/provider)

## Usage

Install the plugin by running the following command **from your Backstage root directory**

`yarn --cwd packages/app add @backstage-community/plugin-github-issues`

After installation, the plugin can be used as a Card or as a Page.

```typescript
import {
  GithubIssuesCard,
  GithubIssuesPage,
} from '@backstage-community/plugin-github-issues';

// To use as a page Plugin needs to be wrapped in EntityLayout.Route
const RenderGitHubIssuesPage = () => (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <EntityLayout.Route path="github-issues" title="GitHub Issues">
        <GithubIssuesPage />
      </EntityLayout.Route>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);

// To use as a card and make it render correctly please place it inside appropriate Grid elements
const RenderGitHubIssuesCard = () => (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <GithubIssuesCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);
```

## Configuration

Both `GithubIssuesPage` and `GithubIssuesCard` provide default configuration. It is ready to use out of the box.
However, you can configure the plugin with props:

- `itemsPerPage: number = 10` - Issues in the list are paginated, number of issues on a single page is controlled with this prop
- `itemsPerRepo: number = 40` - the plugin doesn't download all Issues available on GitHub. By default, it will get at most 40 Issues - this prop controls this behaviour
- `filterBy: object` - the plugin can be configured to filter the query by `assignee`, `createdBy`, `labels`, `states`, `mentioned` or `milestone`.
- `orderBy: object = { field: 'UPDATED_AT', direction: 'DESC' }` - The ordering that the issues are returned can be configured by the `orderBy` field.

### `filterBy` and `orderBy` example

```ts
<GithubIssuesCard
  filterBy={{
    labels: ['bug', 'enhancement'],
    states: ['OPEN'],
  }}
  orderBy={{
    field: 'COMMENTS',
    direction: 'ASC',
  }}
/>
```

## Integrating with the new Frontend System

Follow this section if you are using Backstage's [new frontend system](https://backstage.io/docs/frontend-system/).

1. Import `githubIssuesPlugin` in your `App.tsx` and add it to your app's `features` array:

```typescript
import githubIssuesPlugin from '@backstage-community/plugin-github-issues/alpha';
// ...
export const app = createApp({
  features: [
    // ...
    githubIssuesPlugin,
    // ...
  ],
});
```

2. Next, enable your desired extensions in `app-config.yaml`

```yaml
app:
  extensions:
    - entity-content:github-issues/entity
    - entity-card:github-issues/overview
```

3. Whichever extensions you've enabled should now appear in your entity page.
