# GitHub Pull Requests Board Plugin

> [!Note]
> Backstage UI (BUI) is now required for the GitHub Pull Requests Board plugin to function, BUI has been included as part of Backstage since `1.41.0` which means you're very likely to already have it installed. The [BUI documentation](https://ui.backstage.io/) has details on installation if needed and the Backstage [User Interface documentation](https://backstage.io/docs/conf/user-interface/) has details on creating a custom BUI theme.

The GitHub Pull Requests Board Plugin helps to visualise all **Open Pull Requests** related to the owned team repository.

It will help you and your team stay on top of open pull requests, hopefully reducing the time from open to merged. It's particularly useful when your team deals with many repositories.

## Screenshots

### Card View

![GitHub Pull Requests Board Card](docs/github-pull-requests-board-card.png)

### Tab View

![GitHub Pull Requests Board Tab](docs/github-pull-requests-board-tab.png)

## Prerequisites

- [GitHub Authentication Provider](https://backstage.io/docs/auth/github/provider) (With `read-only` permission granted for `Pull Requests`)

## Getting started

Install the plugin by running the following command **from your Backstage root directory**

`yarn --cwd packages/app add @backstage-community/plugin-github-pull-requests-board`

The plugin exports the **EntityTeamPullRequestsCard** component which can be added to the Overview page of the team at `backstage/packages/app/src/components/catalog/EntityPage.tsx`

```javascript
import { EntityTeamPullRequestsCard } from '@backstage-community/plugin-github-pull-requests-board';

const groupPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityGroupProfileCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard
            variant="gridItem"
            entityFilterKind={customEntityFilterKind}
          />
        </Grid>
        <Grid item xs={12}>
          <EntityMembersListCard />
        </Grid>
        <Grid item xs={12}>
          <EntityTeamPullRequestsCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);
```

Or you can also import the **EntityTeamPullRequestsContent** component which can be used to add a new tab under the group page at `backstage/packages/app/src/components/catalog/EntityPage.tsx`

```javascript
import { EntityTeamPullRequestsContent } from '@backstage-community/plugin-github-pull-requests-board';

const groupPage = (
    <EntityLayoutWrapper>
        <EntityLayout.Route path="/" title="Overview">
            <Grid container spacing={3}>
            {entityWarningContent}
            <Grid item xs={12} md={6}>
                <EntityGroupProfileCard variant="gridItem" />
            </Grid>
            <Grid item xs={12} md={6}>
                <EntityOwnershipCard
                variant="gridItem"
                entityFilterKind={customEntityFilterKind}
                />
            </Grid>
            <Grid item xs={12}>
                <EntityMembersListCard />
            </Grid>
            </Grid>
        </EntityLayout.Route>
        <EntityLayout.Route path="/pull-requests" title="Pull Requests">
            <EntityTeamPullRequestsContent />
        </EntityLayout.Route>
    </EntityLayoutWrapper>;
)
```

## Integrating with the new Frontend System

Follow this section if you are using Backstage's [new frontend system](https://backstage.io/docs/frontend-system/).

Import `githubPullRequestsPlugin` in your `App.tsx` and add it to your app's `features` array:

```typescript
import githubPullRequestsPlugin from '@backstage-community/plugin-github-pull-requests-board/alpha';
// ...
export const app = createApp({
  features: [
    // ...
    githubPullRequestsPlugin,
    // ...
  ],
});
```
