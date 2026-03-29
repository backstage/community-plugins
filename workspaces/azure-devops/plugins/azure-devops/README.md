# Azure DevOps Plugin

Website: [https://dev.azure.com/](https://dev.azure.com/)

> [!Note]
> Backstage UI (BUI) is now required for the Azure DevOps plugin to function, BUI has been included as part of Backstage since `1.41.0` which means you're very likely to already have it installed. The [BUI documentation](https://ui.backstage.io/) has details on installation if needed and the Backstage [User Interface documentation](https://backstage.io/docs/conf/user-interface/) has details on creating a custom BUI theme.

## Table of Contents

- [Azure DevOps Plugin](#azure-devops-plugin)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Azure Pipelines](#azure-pipelines)
    - [Azure Repos](#azure-repos)
    - [Azure Repos Git Tags](#azure-repos-git-tags)
    - [Azure Repos Pull Request Dashboard](#azure-repos-pull-request-dashboard)
    - [Azure Readme](#azure-readme)
  - [Setup](#setup)
    - [Azure DevOps Backend](#azure-devops-backend)
    - [Entity Annotation](#entity-annotation)
      - [Mono repos](#mono-repos)
      - [Pipeline in different project to repo](#pipeline-in-different-project-to-repo)
      - [Azure Pipelines Only](#azure-pipelines-only)
      - [Multiple Organizations](#multiple-organizations)
      - [Project Names and Repository Names with Spaces](#project-names-and-repository-names-with-spaces)
    - [Azure Pipelines Component](#azure-pipelines-component)
    - [Azure Repos Component](#azure-repos-component)
    - [Git Tags Component](#git-tags-component)
    - [Azure Pull Request Dashboard Page](#azure-pull-request-dashboard-page)
      - [Column Configuration](#column-configuration)
    - [Git README](#git-readme)
  - [Search](#search)
  - [Permission Framework](#permission-framework)
    - [Configure Permission](#configure-permission)
  - [New Frontend System (Alpha)](#new-frontend-system-alpha)
    - [Use new frontend system](#use-new-frontend-system)

## Features

### Azure Pipelines

Lists the top _n_ builds for a given Azure Repo where _n_ is a configurable value

![Azure Pipelines Builds Example](./docs/azure-devops-builds.png)

### Azure Repos

Lists the top _n_ Active, Completed, or Abandoned Pull Requests for a given repository where _n_ is a configurable value

![Azure Repos Pull Requests Example](./docs/azure-devops-pull-requests.png)

### Azure Repos Git Tags

Lists all Git Tags for a given repository

![Azure Repos Git Tags Example](./docs/azure-devops-git-tags.png)

### Azure Repos Pull Request Dashboard

Displays pull request for a single project in a dashboard like view

![Azure Repo Pull Request Dashboard Example](./docs/azure-devops-pull-request-dashboard.png)

Shows pull request by picking the Organization and Project in a dashboard like view

![Azure Repo Pull Request Dashboard Multi-Org Example](./docs/azure-devops-pull-request-dashboard-multi-org.png)

### Azure Readme

Readme for a given repository

![Azure Readme Example](./docs/azure-devops-readme.png)

## Setup

The following sections will help you get the Azure DevOps plugin setup and running

### Azure DevOps Backend

You need to setup the [Azure DevOps backend plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/azure-devops-backend) before you move forward with any of these steps if you haven't already

### Entity Annotation

To be able to use the Azure DevOps plugin you need to add the following annotation to any entities you want to use it with:

```yaml
dev.azure.com/project-repo: <project-name>/<repo-name>
```

Let's break this down a little: `<project-name>` will be the name of your Team Project and `<repo-name>` will be the name of your repository which needs to be part of the Team Project you entered for `<project-name>`.

Here's what that will look like in action:

```yaml
# Example catalog-info.yaml entity definition file
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    dev.azure.com/project-repo: my-project/my-repo
spec:
  type: service
  # ...
```

#### Mono repos

If you have multiple entities within a single repo, you will need to specify which pipelines belong to each entity, like this:

```yaml
dev.azure.com/project-repo: <my-project>/<my-repo>
dev.azure.com/build-definition: <build-definition-name>
```

Then to display the `README` file that belongs to each entity you would add below annotation in addition to the [`project-repo`](#entity-annotation) annotation:

```yaml
dev.azure.com/readme-path: /<path-to>/<my-readme-file>.md
```

> Note: this annotation does not support relative paths as the API we use from Azure DevOps to power this feature does not support relative paths. If you use something like this `dev.azure.com/readme-path: ./docs/index.md` the frontend will throw an error with details about why.

#### Pipeline in different project to repo

If your pipeline is in a different project to the source code, you will need to specify this in the project annotation.

```yaml
dev.azure.com/project-repo: <project-with-source-code>/<my-repo>
dev.azure.com/build-definition: <build-definition-name>
dev.azure.com/project: <project-with-build-code>
```

#### Azure Pipelines Only

If you are only using Azure Pipelines along with a different SCM tool then you can use the following two annotations to see Builds:

```yaml
dev.azure.com/project: <project-name>
dev.azure.com/build-definition: <build-definition-name>
```

In this case `<project-name>` will be the name of your Team Project and `<build-definition-name>` will be the name of the Build Definition you would like to see Builds for, and it's possible to add more Builds separated by a comma. If the Build Definition name has spaces in it make sure to put quotes around it.

> Note: If you are unsure what your Build Definition name is you can confirm this value by going to the [Pipeline Settings in Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline?view=azure-devops#pipeline-settings) and clicking on "Rename/move" from the context menu. The current Build Definition name will be in the dialog box that opens, use this value. It will not be `<some-definition-name>.yml`.

#### Multiple Organizations

If you have multiple organizations you'll need to also add this annotation:

```yaml
dev.azure.com/host-org: <host>/<organization>
```

For this annotation `<host>` will match the `host` value in the `integrations.azure` section in your `app-config.yaml` and `<organization>` will be the name of the Organization that is part of the `host`. Let's break this down with an example:

Say we have the following `integrations.azure` section:

```yaml
integrations:
  azure:
    - host: dev.azure.com
      credentials:
        - organizations:
            - my-org
            - my-other-org
          clientId: ${AZURE_CLIENT_ID}
          clientSecret: ${AZURE_CLIENT_SECRET}
          tenantId: ${AZURE_TENANT_ID}
        - organizations:
            - another-org
          clientId: ${AZURE_CLIENT_ID}
    - host: server.company.com
      credentials:
        - organizations:
            - yet-another-org
          personalAccessToken: ${PERSONAL_ACCESS_TOKEN}
```

If the entity we are viewing lives in the `my-other-org` organization then the `dev.azure.com/host-org` annotation would look like this:

```yaml
dev.azure.com/host-org: dev.azure.com/my-other-org
```

And if the entity was from `yet-another-org` it would look like this:

```yaml
dev.azure.com/host-org: server.company.com/yet-another-org
```

**Note:** To save you time, effort, and confusion setting up these annotations manually you can use the `AzureDevOpsAnnotatorProcessor` processor which will add the `dev.azure.com/host-org` and `dev.azure.com/project-repo` annotations for you with the correct values. The Azure DevOps Annotator Processor backend module for the Catalog plugin has details on how to [add this processor](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/catalog-backend-module-azure-devops-annotator-processor).

#### Project Names and Repository Names with Spaces

Regarding spaces in project names or repository names, though the author of this plugin often says "spaces are the devil", these have been tested with this plugin and will work as is in the annotations. They will also be added correctly for you when using the `AzureDevOpsAnnotatorProcessor`.

Given a project name like "Has Spaces" and a repository name of "With Space" the `dev.azure.com/project-repo` annotation would look like this:

```yaml
dev.azure.com/project-repo: Has Spaces/With Space
```

Alternatively you can put quotes around the value which would work as well, like this:

```yaml
dev.azure.com/project-repo: 'Has Spaces/With Space'
```

the same would apply to the `dev.azure.com/project` annotation using "Has Spaces" as the project name would look like this:

```yaml
dev.azure.com/project: Has Spaces
```

Or using quotes, like this:

```yaml
dev.azure.com/project: 'Has Spaces'
```

### Azure Pipelines Component

To get the Azure Pipelines component working you'll need to do the following two steps:

1. First we need to add the `@backstage-community/plugin-azure-devops` package to your frontend app:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-azure-devops
   ```

2. Second we need to add the `EntityAzurePipelinesContent` extension to the entity page in your app. How to do this will depend on which annotation you are using in your entities:

   1. If you are using the `dev.azure.com/project-repo` annotation then you'll want to do the following:

      ```tsx
      // In packages/app/src/components/catalog/EntityPage.tsx
      import {
        EntityAzurePipelinesContent,
        isAzureDevOpsAvailable,
      } from '@backstage-community/plugin-azure-devops';

      // For example in the CI/CD section
      const cicdContent = (
        <EntitySwitch>
          // ...
          <EntitySwitch.Case if={isAzureDevOpsAvailable}>
              <EntityAzurePipelinesContent defaultLimit={25} />
          </EntitySwitch.Case>
          // ...
        </EntitySwitch>
      ```

   2. If you are using the `dev.azure.com/project` and `dev.azure.com/build-definition` annotations then you'll want to do this:

      ```tsx
      // In packages/app/src/components/catalog/EntityPage.tsx
      import {
        EntityAzurePipelinesContent,
        isAzurePipelinesAvailable,
      } from '@backstage-community/plugin-azure-devops';

      // For example in the CI/CD section
      const cicdContent = (
        <EntitySwitch>
          // ...
          <EntitySwitch.Case if={isAzurePipelinesAvailable}>
            <EntityAzurePipelinesContent defaultLimit={25} />
          </EntitySwitch.Case>
          // ...
        </EntitySwitch>
      ```

**Notes:**

- The `if` prop is optional on the `EntitySwitch.Case`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation
- The `defaultLimit` property on the `EntityAzurePipelinesContent` will set the max number of Builds you would like to see, if not set this will default to 10

### Azure Repos Component

To get the Azure Repos component working you'll need to do the following two steps:

1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-azure-devops
   ```

2. Second we need to add the `EntityAzurePullRequestsContent` extension to the entity page in your app:

   ```tsx
   // In packages/app/src/components/catalog/EntityPage.tsx
   import {
     EntityAzurePullRequestsContent,
     isAzureDevOpsAvailable,
   } from '@backstage-community/plugin-azure-devops';

   // For example in the Service section
   const serviceEntityPage = (
     <EntityLayout>
       // ...
       <EntityLayout.Route if={isAzureDevOpsAvailable} path="/pull-requests" title="Pull Requests">
         <EntityAzurePullRequestsContent defaultLimit={25} />
       </EntityLayout.Route>
       // ...
     </EntityLayout>
   ```

**Notes:**

- You'll need to add the `EntityLayout.Route` above from step 2 to all the entity sections you want to see Pull Requests in. For example if you wanted to see Pull Requests when looking at Website entities then you would need to add this to the `websiteEntityPage` section.
- The `if` prop is optional on the `EntityLayout.Route`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation
- The `defaultLimit` property on the `EntityAzurePullRequestsContent` will set the max number of Pull Requests you would like to see, if not set this will default to 10

### Git Tags Component

To get the Git Tags component working you'll need to do the following two steps:

1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-azure-devops
   ```

2. Second we need to add the `EntityAzureGitTagsContent` extension to the entity page in your app:

   ```tsx
   // In packages/app/src/components/catalog/EntityPage.tsx
   import {
     EntityAzureGitTagsContent,
     isAzureDevOpsAvailable,
   } from '@backstage-community/plugin-azure-devops';

   // For example in the Service section
   const serviceEntityPage = (
     <EntityLayout>
       // ...
       <EntityLayout.Route if={isAzureDevOpsAvailable} path="/git-tags" title="Git Tags">
         <EntityAzureGitTagsContent />
       </EntityLayout.Route>
       // ...
     </EntityLayout>
   ```

**Notes:**

- You'll need to add the `EntityLayout.Route` above from step 2 to all the entity sections you want to see Git Tags in. For example if you wanted to see Git Tags when looking at Website entities then you would need to add this to the `websiteEntityPage` section.
- The `if` prop is optional on the `EntityLayout.Route`, you can remove it if you always want to see the tab even if the entity being viewed does not have the needed annotation

### Azure Pull Request Dashboard Page

To get the Azure Pull Request Dashboard page working you'll need to do the following steps:

1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-azure-devops
   ```

2. Second we need to add the `AzurePullRequestsPage` component as a route in your app. You have two options depending on your setup:

   **Option A - Single Organization/Project:** Pass the `projectName` prop to pre-select a specific project:

   ```tsx
   // In packages/app/src/App.tsx
   import { AzurePullRequestsPage } from '@backstage-community/plugin-azure-devops';

   // Add the route to your FlatRoutes
   const routes = (
     <FlatRoutes>
       // ...
       <Route
         path="/azure-pull-requests"
         element={<AzurePullRequestsPage projectName="my-project" />}
       />
       // ...
     </FlatRoutes>
   );
   ```

   **Option B - Multiple Organizations/Projects:** Leave the `projectName` prop unset and configure the available options through your `app-config.yaml`. This allows users to select from the configured organizations and projects using dropdown filters on the page:

   ```tsx
   // In packages/app/src/App.tsx
   import { AzurePullRequestsPage } from '@backstage-community/plugin-azure-devops';

   // Add the route to your FlatRoutes
   const routes = (
     <FlatRoutes>
       // ...
       <Route path="/azure-pull-requests" element={<AzurePullRequestsPage />} />
       // ...
     </FlatRoutes>
   );
   ```

   ```yaml
   # In your app-config.yaml
   azureDevOps:
     pullRequestDashboard:
       organizations:
         - organization: my-org
           host: dev.azure.com
         - organization: my-other-org
           host: dev.azure.com
   ```

3. Third, add the page to your sidebar navigation:

   ```tsx
   // In packages/app/src/components/Root/Root.tsx
   import { AzurePullRequestsIcon } from '@backstage-community/plugin-azure-devops';

   // Add to your sidebar
   export const Root = ({ children }: PropsWithChildren<{}>) => (
     <SidebarPage>
       <Sidebar>
         {/* ... */}
         <SidebarGroup label="Menu" icon={<MenuIcon />}>
           {/* ... other sidebar items ... */}
           <SidebarItem
             icon={AzurePullRequestsIcon}
             to="azure-pull-requests"
             text="Azure PRs"
           />
         </SidebarGroup>
         {/* ... */}
       </Sidebar>
       {children}
     </SidebarPage>
   );
   ```

#### Column Configuration

The `AzurePullRequestsPage` includes a set of two columns - Created by me (using the `CreatedByCurrentUser` filter) and Other PRs (using the `All` filter) - by default but you can provide your own column configuration by using the `defaultColumnConfigs` prop. Here's an example, this mimics the default setup:

```ts
const DEFAULT_COLUMN_CONFIGS: PullRequestColumnConfig[] = [
  {
    title: 'Created by me',
    filters: [{ type: FilterType.CreatedByCurrentUser }],
    simplified: false,
  },
  {
    title: 'Other PRs',
    filters: [{ type: FilterType.All }],
    simplified: true,
  },
];
```

**Notes:**

- Setting `simplified` to `false` will show more details on the cards
- The `FilterType` and the `PullRequestColumnConfig` are exported from the `@backstage-community/plugin-azure-devops` plugin
- User in the context of the filters is based on the current user logged into Backstage and the email address returned from the `identityApi.getProfileInfo()`

Filters work on the open PRs based on the configured or selected Organization and Project. The available filters you can use are:

- `FilterType.All`
- `FilterType.AssignedToUser`
- `FilterType.AssignedToCurrentUser`
- `FilterType.AssignedToTeam`
- `FilterType.AssignedToTeams`
- `FilterType.AssignedToCurrentUsersTeams`
- `FilterType.CreatedByUser`
- `FilterType.CreatedByCurrentUser`
- `FilterType.CreatedByTeam`
- `FilterType.CreatedByTeams`
- `FilterType.CreatedByCurrentUsersTeams`

### Git README

To get the README component working you'll need to do the following two steps:

1. First we need to add the @backstage-community/plugin-azure-devops package to your frontend app:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-azure-devops
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

## Search

First, make sure to setup Backstage Search with the [@backstage-community/plugin-search-backend-module-azure-devops](../search-backend-module-azure-devops/) plugin.
Afterwards, add the following code snippet to use `AzureDevOpsWikiArticleSearchResultListItem` when the type of the search results is `azure-devops-wiki-article`:

```tsx
// In packages/app/src/components/search/SearchPage.tsx
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import { AzureDevOpsWikiArticleSearchResultListItem } from '@backstage-community/plugin-azure-devops';


...
// Optional - Add type to side pane
<SearchType.Accordion
  name="Result Type"
  defaultValue="software-catalog"
  types={[
    ...
    {
      value: 'azure-devops-wiki-article',
      name: 'Azure DevOps Wiki',
      icon: <LibraryBooksIcon />,
    },
  ]}
/>
...

// In results
<SearchResult>
  ... other items ...
  <AzureDevOpsWikiArticleSearchResultListItem icon={<LibraryBooksIcon />}/>
</SearchResult>
```

## Permission Framework

Azure DevOps plugin supports the permission framework for PRs, GitTags, Pipelines and Readme features. To use these permissions you'll need to add the `@backstage-community/plugin-azure-devops-common` to the same location as your [Permission Policy](https://backstage.io/docs/permissions/writing-a-policy). This example assumes that your Permission Policy lives in your `packages/backend`:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-azure-devops-common
```

### Configure Permission

To apply the permission rules add the following in to your [Permission Policy](https://backstage.io/docs/permissions/writing-a-policy).

> Note: the following is just an example of how you might want to setup permissions, as an Adopter you can configure this to fit your needs. Also all the permissions are Resource Permissions as they work with an Entity with the exception of `azureDevOpsPullRequestDashboardReadPermission`.

```diff

+ import {
+  azureDevOpsPullRequestReadPermission,
+  azureDevOpsPipelineReadPermission,
+  azureDevOpsGitTagReadPermission,
+  azureDevOpsReadmeReadPermission,
+  azureDevOpsPullRequestDashboardReadPermission } from '@backstage-community/plugin-azure-devops-common';
+ import {
+  AuthorizeResult,
+  PolicyDecision,
+  isPermission,
+ } from '@backstage/plugin-permission-common';
+ import {
+   catalogConditions,
+   createCatalogConditionalDecision,
+ } from '@backstage/plugin-catalog-backend/alpha';
...
async handle(
  request: PolicyQuery,
  user?: BackstageIdentityResponse,
): Promise<PolicyDecision> {
+ if ( isPermission(request.permission, azureDevOpsPullRequestReadPermission) ||
+      isPermission(request.permission, azureDevOpsPipelineReadPermission) ||
+      isPermission(request.permission, azureDevOpsGitTagReadPermission) ||
+      isPermission(request.permission, azureDevOpsReadmeReadPermission)) {
+    return createCatalogConditionalDecision(
+      request.permission,
+      catalogConditions.isEntityOwner({
+          claims: user?.identity.ownershipEntityRefs ?? [],
+       }),
+    );
+  }

+ if ( isPermission(request.permission, azureDevOpsPullRequestDashboardReadPermission) {
+ return {
+   result: AuthorizeResult.ALLOW,
+  };
+ }

  return {
    result: AuthorizeResult.ALLOW,
  };
}
```

## New Frontend System (Alpha)

The Azure DevOps plugin currently support the New Frontend System via an `/alpha` export, here's how to use it:

### Use new frontend system

1. Install the frontend plugin:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-azure-devops
   ```

2. Enable the plugin in your `packages/app(-next)/src/App.tsx`:

   After all other imports:

   ```tsx
   import azureDevOpsPlugin from '@backstage-community/plugin-azure-devops';
   ```

   ```tsx
   export const app = createApp({
     features: [
       catalogPlugin,
       catalogImportPlugin,
       userSettingsPlugin,
       azureDevOpsPlugin,
       // ...
     ],
   });
   ```

   Alternatively you can simply use feature discover and skip the above step by adding the following yo your `app-config.yaml` file:

   ```yaml
   app:
     packages: all
   ```
