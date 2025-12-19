# Jfrog Artifactory plugin for Backstage

The Jfrog Artifactory plugin displays information about your container images within the Jfrog Artifactory registry.

## For administrators

### Installation and configuration

#### Procedure

1. Run the following command to install the Jfrog Artifactory plugin:

   ```console
   yarn workspace app add @backstage-community/plugin-jfrog-artifactory
   ```

1. Configure the Artifactory plugin in the `app-config.yaml` file as follows:

   ```yaml title="app-config.yaml"
   # JFrog Artifactory configuration
   jfrogArtifactory:
     proxyPath: /jfrog-artifactory/api
     # Sort field for artifacts: 'NAME_SEMVER' or 'MODIFIED'
     sortField: 'MODIFIED'
     # Repository filter for artifacts
     repoFilter: '*-prod-federated'
     # Maximum number of artifacts to fetch per request (default: 100)
     pageLimit: 100

   proxy:
     endpoints:
       '/jfrog-artifactory/api':
         target: 'http://<hostname>:8082' # or https://<customer>.jfrog.io
         headers:
           # Authorization: 'Bearer <YOUR TOKEN>'
         # Change to "false" in case of using self hosted artifactory instance with a self-signed certificate
         secure: true
   ```

   - The `sortField` option determines how artifacts are sorted in the UI:
   - `NAME_SEMVER`: Sort by semantic version name (default if not specified)
   - `MODIFIED`: Sort by last modified date

   - The `repoFilter` option determines which repositories to include when displaying artifacts. It supports wildcard patterns (e.g., '\*-prod-federated') to filter artifacts by repository name. When specified, only artifacts from repositories matching this pattern will be shown.

   - The `pageLimit`: Controls the maximum number of artifacts fetched per request (default: 100)
     - **Note**: This setting limits the number of artifacts displayed in the UI
     - If you have many artifacts, consider increasing this value to see more results

If you have multiple instances of artifactory supported, you can set up multiple proxy target paths as follows:

```yaml title="app-config.yaml"
proxy:
  endpoints:
    '/jfrog-instance1': # This is a local alias for the proxy endpoint, not the actual Artifactory hostname
      target: 'https://<hostname1>'
      # Rest of the config for hostname1
    '/jfrog-instance2':
      target: 'https://<hostname2>'
```

1. Enable the **JFROG ARTIFACTORY** tab on the entity view page in `packages/app/src/components/catalog/EntityPage.tsx`:

   ```ts title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-start */
   import {
     isJfrogArtifactoryAvailable,
     JfrogArtifactoryPage,
   } from '@backstage-community/plugin-jfrog-artifactory';

   /* highlight-add-end */

   const serviceEntityPage = (
     <EntityLayout>
       // ...
       {/* highlight-add-start */}
       <EntityLayout.Route
         if={isJfrogArtifactoryAvailable}
         path="/jfrog-artifactory"
         title="Jfrog Artifactory"
       >
         <JfrogArtifactoryPage />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityLayout>
   );
   ```

1. Annotate your entity with the following annotations:

   ```yaml title="catalog-info.yaml"
   metadata:
     annotations:
       'jfrog-artifactory/image-name': '<IMAGE-NAME>'
       # if your app supports multiple artifactory instances,
       # you'll need to specify the instance proxy target path your image belongs to
       'jfrog-artifactory/target-proxy': '/<PROXY-TARGET>' # e.g. `/jfrog-instance1` from the example above
       # Optional: filter repositories by name pattern
       'jfrog-artifactory/repo-filter': '*-prod-federated'
   ```

   The annotations serve the following purposes:

   - `jfrog-artifactory/image-name`: Specifies the image name to display in the Artifactory tab
   - `jfrog-artifactory/target-proxy`: Specifies which Artifactory instance to use (for multiple instances)
   - `jfrog-artifactory/repo-filter`: Optional filter to limit which repositories are displayed for this entity (supports wildcard patterns)

   **Note on repository filtering:**

   - The `jfrog-artifactory/repo-filter` annotation provides entity-specific repository filtering
   - If the annotation is not defined for an entity, the global `repoFilter` from app-config.yaml will be used
   - Entity-level annotation takes precedence over the global configuration
   - This allows for both global defaults and per-entity customization

## For users

### Using the Jfrog Artifactory plugin in Backstage

Jfrog Artifactory is a front-end plugin that enables you to view the information about the container images that are available in your Jfrog Artifactory registry.

#### Prerequisites

- Your Backstage application is installed and running.
- You have installed the Jfrog Artifactory plugin. For installation and configuration steps, see [Installation and configuration](#installation-and-configuration).

#### Procedure

1. Open your Backstage application and select a component from the **Catalog** page.

1. Go to the **JFROG ARTIFACTORY** tab.

   ![jfrog-tab](./images/jfrog-plugin-user1.png)

   The **JFROG ARTIFACTORY** tab contains a list of container images and related information, such as **VERSION**, **REPOSITORIES**, **MANIFEST**, **MODIFIED**, and **SIZE**.
