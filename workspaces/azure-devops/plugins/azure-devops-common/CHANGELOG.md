# @backstage-community/plugin-azure-devops-common

## 0.4.2

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.

## 0.4.1

### Patch Changes

- 95b0573: `getAllTeams` now accepts an optional `limit` parameter which can be used to return more than the default limit of 100 teams from the Azure DevOps API

  `pullRequestOptions` have been equipped with `teamsLimit` so that the property can be used with `getAllTeams`

- Updated dependencies
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-permission-common@0.7.13

## 0.4.1-next.0

### Patch Changes

- 95b0573: `getAllTeams` now accepts an optional `limit` parameter which can be used to return more than the default limit of 100 teams from the Azure DevOps API

  `pullRequestOptions` have been equipped with `teamsLimit` so that the property can be used with `getAllTeams`

- Updated dependencies
  - @backstage/plugin-catalog-common@1.0.22
  - @backstage/plugin-permission-common@0.7.13

## 0.4.0

### Minor Changes

- 9fdb86a: Ability to fetch the README file from a different Azure DevOps path.

  Defaults to the current, Azure DevOps default behaviour (`README.md` in the root of the git repo); to use a different path, add the annotation `dev.azure.com/readme-path`

  Example:

  ```yaml
  dev.azure.com/readme-path: /my-path/README.md
  ```

### Patch Changes

- 3270b1b: Azure DevOps plugin is now integrated with permission framework for its core features, see the https://github.com/backstage/backstage/blob/master/plugins/azure-devops/README.md#permission-framework for more details.
- Updated dependencies
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-catalog-common@1.0.22

## 0.4.0-next.1

### Patch Changes

- 3270b1b: Azure DevOps plugin is now integrated with permission framework for its core features, see the https://github.com/backstage/backstage/blob/master/plugins/azure-devops/README.md#permission-framework for more details.
- Updated dependencies
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-catalog-common@1.0.22-next.1

## 0.4.0-next.0

### Minor Changes

- 9fdb86a: Ability to fetch the README file from a different Azure DevOps path.

  Defaults to the current, Azure DevOps default behaviour (`README.md` in the root of the git repo); to use a different path, add the annotation `dev.azure.com/readme-path`

  Example:

  ```yaml
  dev.azure.com/readme-path: /my-path/README.md
  ```

## 0.3.2

### Patch Changes

- c70e4f5: Added multi-org support
- 043b724: Introduced new `AzureDevOpsAnnotatorProcessor` that adds the needed annotations automatically. Also, moved constants to common package so they can be shared more easily

## 0.3.2-next.1

### Patch Changes

- c70e4f5: Added multi-org support

## 0.3.2-next.0

### Patch Changes

- 043b724c56: Introduced new `AzureDevOpsAnnotatorProcessor` that adds the needed annotations automatically. Also, moved constants to common package so they can be shared more easily

## 0.3.1

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.

## 0.3.1-next.0

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.

## 0.3.0

### Minor Changes

- 6c1c59b96e: Added README card `EntityAzureReadmeCard` for Azure Devops.

  To get the README component working you'll need to do the following two steps:

  1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

     ```bash
     # From your Backstage root directory
     yarn add --cwd packages/app @backstage-community/plugin-azure-devops
     ```

  2. Second we need to add the `EntityAzureReadmeCard` extension to the entity page in your app:

     ```tsx
     // In packages/app/src/components/catalog/EntityPage.tsx
     import {
       EntityAzureReadmeCard,
       isAzureDevOpsAvailable,
     } from '@backstage-community/plugin-azure-devops';

     // As it is a card, you can customize it the way you prefer
     // For example in the Service section

     const overviewContent = (
       <Grid container spacing={3} alignItems="stretch">
         <EntitySwitch>
           <EntitySwitch.Case if={isAzureDevOpsAvailable}>
             <Grid item md={6}>
               ...
             </Grid>
             <Grid item md={6}>
               <EntityAzureReadmeCard maxHeight={350} />
             </Grid>
           </EntitySwitch.Case>
         </EntitySwitch>
       </Grid>
     );
     ```

  **Notes:**

  - You'll need to add the `EntitySwitch.Case` above from step 2 to all the entity sections you want to see Readme in. For example if you wanted to see Readme when looking at Website entities then you would need to add this to the `websiteEntityPage` section.
  - The `if` prop is optional on the `EntitySwitch.Case`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation
  - The `maxHeight` property on the `EntityAzureReadmeCard` will set the maximum screen size you would like to see, if not set it will default to 100%

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup

## 0.3.0-next.0

### Minor Changes

- 6c1c59b96e: Added README card `EntityAzureReadmeCard` for Azure Devops.

  To get the README component working you'll need to do the following two steps:

  1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

     ```bash
     # From your Backstage root directory
     yarn add --cwd packages/app @backstage-community/plugin-azure-devops
     ```

  2. Second we need to add the `EntityAzureReadmeCard` extension to the entity page in your app:

     ```tsx
     // In packages/app/src/components/catalog/EntityPage.tsx
     import {
       EntityAzureReadmeCard,
       isAzureDevOpsAvailable,
     } from '@backstage-community/plugin-azure-devops';

     // As it is a card, you can customize it the way you prefer
     // For example in the Service section

     const overviewContent = (
       <Grid container spacing={3} alignItems="stretch">
         <EntitySwitch>
           <EntitySwitch.Case if={isAzureDevOpsAvailable}>
             <Grid item md={6}>
               ...
             </Grid>
             <Grid item md={6}>
               <EntityAzureReadmeCard maxHeight={350} />
             </Grid>
           </EntitySwitch.Case>
         </EntitySwitch>
       </Grid>
     );
     ```

  **Notes:**

  - You'll need to add the `EntitySwitch.Case` above from step 2 to all the entity sections you want to see Readme in. For example if you wanted to see Readme when looking at Website entities then you would need to add this to the `websiteEntityPage` section.
  - The `if` prop is optional on the `EntitySwitch.Case`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation
  - The `maxHeight` property on the `EntityAzureReadmeCard` will set the maximum screen size you would like to see, if not set it will default to 100%

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup

## 0.2.4

### Patch Changes

- e67c4b7d5a: Adding getProjects endpoint to list out all projects associated with the Azure DevOps organization.

  It can be accessed by using this endpoint `{backendUrl}/api/azure-devops/projects`

## 0.2.4-next.0

### Patch Changes

- e67c4b7d5a: Adding getProjects endpoint to list out all projects associated with the Azure DevOps organization.

  It can be accessed by using this endpoint `{backendUrl}/api/azure-devops/projects`

## 0.2.3

### Patch Changes

- ac14fcaf38: Added entity view for Azure Git Tags, based on existing Pull Requests view

## 0.2.3-next.0

### Patch Changes

- ac14fcaf38: Added entity view for Azure Git Tags, based on existing Pull Requests view

## 0.2.2

### Patch Changes

- Fix for the previous release with missing type declarations.

## 0.2.1

### Patch Changes

- c77c5c7eb6: Added `backstage.role` to `package.json`

## 0.2.0

### Minor Changes

- a2ed2c2d69: - feat: Created PullRequestsDashboardProvider for resolving team and team member relations
  - feat: Created useUserTeamIds hook.
  - feat: Updated useFilterProcessor to provide teamIds for `AssignedToCurrentUsersTeams` and `CreatedByCurrentUsersTeams` filters.

## 0.1.3

### Patch Changes

- daf32e2c9b: Created some initial filters that can be used to create pull request columns:

  - All
  - AssignedToUser
  - AssignedToCurrentUser
  - AssignedToTeam
  - AssignedToTeams
  - AssignedToCurrentUsersTeams
  - CreatedByUser
  - CreatedByCurrentUser
  - CreatedByTeam
  - CreatedByTeams
  - CreatedByCurrentUsersTeams

  Example custom column creation:

  ```tsx
  const COLUMN_CONFIGS: PullRequestColumnConfig[] = [
    {
      title: 'Created by me',
      filters: [{ type: FilterType.CreatedByCurrentUser }],
    },
    {
      title: 'Created by Backstage Core',
      filters: [
        {
          type: FilterType.CreatedByTeam,
          teamName: 'Backstage Core',
        },
      ],
    },
    {
      title: 'Assigned to my teams',
      filters: [{ type: FilterType.AssignedToCurrentUsersTeams }],
    },
    {
      title: 'Other PRs',
      filters: [{ type: FilterType.All }],
      simplified: true,
    },
  ];

  <Route
    path="/azure-pull-requests"
    element={
      <AzurePullRequestsPage
        projectName="{PROJECT_NAME}"
        defaultColumnConfigs={COLUMN_CONFIGS}
      />
    }
  />;
  ```

## 0.1.2

### Patch Changes

- a77526afcd: Added getting builds by definition name

## 0.1.1

### Patch Changes

- 0749dd0307: feat: Created pull request card component and initial pull request dashboard page.

## 0.1.0

### Minor Changes

- 2b5ccd2964: Improved Date handling for the Azure DevOps set of plugins by using strings and letting the frontend handle the conversion to DateTime

## 0.0.2

### Patch Changes

- b85acc8c35: refactor(`@backstage-community/plugin-azure-devops`): Consume types from `@backstage-community/plugin-azure-devops-common`.
  Stop re-exporting types from `@backstage-community/plugin-azure-devops-backend`.
  Added new types to `@backstage-community/plugin-azure-devops-common`.
