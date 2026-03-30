# Apiiro Plugin for Backstage

The Apiiro plugin for Backstage integrates Apiiro's application risk management capabilities directly into your Backstage developer portal. This plugin empowers developers to code securely by automatically checking for security vulnerabilities and enables them to review and address newly introduced vulnerabilities directly in Backstage.

## Plugin Compatibility

The plugin has been successfully tested with Backstage v1.44.0 If you are using a newer version of Backstage, please file an issue, and we will provide guidance on the best integration practices for your specific version.

## Features

- **Dashboard View**: Repository list with statistics sourced from Apiiro
- **Application List**: Comprehensive list of all applications integrated with Apiiro
- **Apiiro Tab**: In-depth view of open risks and detailed metrics of repositories and applications
- **Apiiro Widget**: High-level overview widget that can be embedded in custom entity tabs
- **Permission Control**: Conditional permissions for fine-grained access control to Apiiro metrics

> [!NOTE]
> The Application List and Apiiro Tab (System) require the Backstage connector to be configured in Apiiro to function properly.

## Views

### Dashboard – Repository List

Displays the list of integrated repositories along with statistics sourced from Apiiro. Clicking on a repository redirects you to the Apiiro tab for detailed insights.

![Dashboard Repository List](../../assets/dashboard.png)

### Apiiro Tab (Component)

Provides an in-depth look at each repository's open risks and detailed metrics retrieved from Apiiro. The risk view links and "Go to Apiiro" button redirect to the development risks tab in Apiiro.

![Apiiro Tab](../../assets/apiiro-tab.png)

### Apiiro Widget

Offers a high-level overview of the repository, including programming languages and top risk details. Can be added to any custom entity tab. "Go to Apiiro" button redirect to the development risks tab in Apiiro.

![Apiiro Widget](../../assets/apiiro-widget.png)

### Application List

Displays a comprehensive list of all applications integrated with Apiiro, including risk scores, repository counts, and key metrics. This view is available when the applications view is enabled in the configuration.

> [!NOTE]
> This feature requires the Backstage connector to be configured in Apiiro.

![Application List](../../assets/application-list.png)

### Apiiro Tab (System)

Provides a detailed view of applications with comprehensive risk insights, associated repositories, and security metrics. This tab displays application-level statistics and allows navigation between repositories and risks within the application context. The risks view links and "Go to Apiiro" button redirect to the development risks tab in Apiiro.

> [!NOTE]
> This feature requires the Backstage connector to be configured in Apiiro.

![Apiiro Tab System](../../assets/application-tab.png)

## Prerequisites

- The entity for a repository must be present within Backstage to see Apiiro results
- Appropriate access permissions to an entity in Backstage are required to view its Apiiro results
- An Apiiro Access Token with at least read permissions

### Dependencies

> [!IMPORTANT]
> Please note that the frontend plugin will not function without the backend plugin.

## Getting Started

### 1. Configure Apiiro Plugin for Backstage

Add the following annotation into your catalog.
To be able to use the Apiiro plugin you need to add the following annotation to any entities you want to use it with:

**For Component entities (repositories):**

```yaml
apiiro.com/repo-id: <apiiro-repo-key>
apiiro.com/allow-metrics-view: "true" or "false" (controls whether the Metrics view appears in the Component Apiiro tab and Apiiro widget)
```

**For System entities (applications):**

```yaml
apiiro.com/application-id: <apiiro-application-key>
apiiro.com/allow-metrics-view: "true" or "false" (controls whether the Metrics view and repository list appears in the System Apiiro tab and Apiiro widget)
```

> [!NOTE]
> Application annotations require the Backstage connector to be configured in Apiiro and `enableApplicationsView` set to `true` in the configuration.

Let's break this down:

- `<apiiro-repo-key>` is the key of your repository in Apiiro
- `<apiiro-application-key>` is the key of your application in Apiiro

Here's what that will look like in action:

```yaml
# Example catalog-info.yaml for Component entity
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  annotations:
    apiiro.com/repo-id: my-repo-key
    apiiro.com/allow-metrics-view: 'true'
---
# Example catalog-info.yaml for System entity
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: my-application
  annotations:
    apiiro.com/application-id: my-application-key
    apiiro.com/allow-metrics-view: 'true'
```

Please find the steps to add the annotation automatically [here](../apiiro-backend/README.md#automatically-adding-apiiro-annotations-optional).

### 2. Install required plugins packages

From your Backstage root directory, run:

```bash
yarn --cwd packages/app add @backstage-community/plugin-apiiro
```

**Note:** The Backstage frontend plugin will not function without the backend plugin. Please find the steps to add the backend plugin [here](../apiiro-backend/README.md#installation).

### 3. Configuration

Add your Apiiro Access Token to your `app-config.yaml` or `app-config.production.yaml`:

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
  enableApplicationsView: false
  redirectDevView: false
  # Optional: Configure default risk filters for the Apiiro Risk Table (Example configuration)
  defaultRiskFilters:
    RiskLevel:
      - Critical
      - High
    RiskInsight:
      - Internet exposed
      - Deployed
    RiskCategory:
      - SAST findings
      - Secrets
    Provider:
      - ApiiroSca
      - AkamaiApiSecurity
    PolicyTags:
      - Security Code Review
      - Compliance Review (PCI)
```

Where:

- `accessToken` is your Apiiro Access Token
- `defaultAllowMetricsView` is a boolean value that controls whether the Metrics view appears in the Apiiro Tab and Apiiro Widget by default. If annotation is not set, this value will be used. Default value is `true`.
- `enableApplicationsView` is a boolean value that enables the Application List and Apiiro Tab on System Entity. Default value is `false`. **Note:** This feature requires the Backstage connector to be configured in Apiiro.
- `redirectDevView` (optional) redirects to the development view of risks in Apiiro. Default value is `false`.
- `defaultRiskFilters` (optional) configures default filters for the Apiiro Risk Table. Please refer to the [backend documentation](../apiiro-backend/README.md#configure-default-risk-filters-optional) for more details.

**How to Retrieve an Access Token from Apiiro:**

1. Log in to your Apiiro instance
2. Go to Settings → Access Token
3. Create a new Access Token with a long expiration period (1 year) and grant at least read permissions
4. Generate and securely save the token

![Apiiro Access Token](../../assets/access-token.png)

### 4. Add Apiiro Tab to Entity Page

In `packages/app/src/components/Catalog/EntityPage.tsx`:

```tsx
// Import the Apiiro tab
import {
  ApiiroTab,
  isApiiroRepoAvailable,
} from '@backstage-community/plugin-apiiro';

// Add the route to your service entity page
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {/* ... other elements */}
    </EntityLayout.Route>

    <EntityLayout.Route
      if={isApiiroRepoAvailable}
      path="/apiiro"
      title="Apiiro"
    >
      <ApiiroTab />
    </EntityLayout.Route>

    {/* ... other elements */}
  </EntityLayout>
);
```

### 5. Add the Apiiro Sidebar with Repositories List (Optional)

In `packages/app/src/App.tsx`:

```tsx
// Import the Apiiro page
import { ApiiroPage } from '@backstage-community/plugin-apiiro';

// Add the route
const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    {/* ... other elements */}
    <Route path="/apiiro" element={<ApiiroPage />} />
    {/* ... other elements */}
  </FlatRoutes>
);
```

Add Apiiro Sidebar Button

In `packages/app/src/components/Root/Root.tsx`:

```tsx
// Import the Apiiro sidebar
import { ApiiroSidebar } from '@backstage-community/plugin-apiiro';

// Add to your sidebar
export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      {/* ... other elements */}

      <ApiiroSidebar />

      {/* ... other elements */}
    </Sidebar>
    {children}
  </SidebarPage>
);
```

### 6. Add Apiiro Tab to System Entity Page (Optional)

To enable application-level insights for System entities, add the Apiiro Tab to your system entity page.

In `packages/app/src/components/Catalog/EntityPage.tsx`:

```tsx
// Import the Apiiro tab
import {
  ApiiroTab,
  isApiiroApplicationAvailable,
} from '@backstage-community/plugin-apiiro';

// Add the route to your system page
const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {/* ... other elements */}
    </EntityLayout.Route>

    <EntityLayout.Route
      if={isApiiroApplicationAvailable}
      path="/apiiro"
      title="Apiiro"
    >
      <ApiiroTab />
    </EntityLayout.Route>

    {/* ... other elements */}
  </EntityLayout>
);
```

### 7. Add Apiiro Widget to Custom Entity Tab (Optional)

The Apiiro plugin for Backstage includes a widget that can be embedded in a custom tab of the Backstage entity. This widget provides an overview of the risk associated with that entity, alongside your other valuable insights.
To add the widget, include the following component in your custom entity tab:

```tsx
// ... other imports here
import {
  ApiiroWidget,
  isApiiroRepoAvailable,
} from '@backstage-community/plugin-apiiro';
// ... other components

// add the following line to import the component at required position
<EntitySwitch>
  <EntitySwitch.Case if={isApiiroRepoAvailable}>
    <Grid item md={12} xs={12}>
      <ApiiroWidget />
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>;
```

## Development

To run the entire project including the backend, run `yarn start` from the workspace root directory.

## Links

- [Backend Plugin Documentation](../apiiro-backend/README.md)
- [Add Annotation Automatically](../apiiro-backend/README.md#automatically-adding-apiiro-annotations-optional)
