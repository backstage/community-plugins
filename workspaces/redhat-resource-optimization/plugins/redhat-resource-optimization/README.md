# Resource Optimization

Welcome to the Resource Optimization plugin!

Based on [Project Koku](https://github.com/project-koku/koku), the Resource Optimization plugin allows users to visualize usage trends and receive optimization recommendations for containers running on OpenShift clusters.

## Getting started

### Install

```sh
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-redhat-resource-optimization
```

### Setup

1. Configure `app-config.yaml`, see [Configuration](#configuration).
2. You can follow one of these options depending on your environment and how you choose to deploy Backstage.

#### Option 1: Static plugin

1. Add the `ResourceOptimizationPage` extension to your `App.tsx` routes

```ts
// packages/app/src/App.tsx

import { ResourceOptimizationPage } from '@backstage-community/plugin-redhat-resource-optimization';

<FlatRoutes>
  ...
  <Route
    path="/redhat-resource-optimization"
    element={<ResourceOptimizationPage />}
  />
  ...
</FlatRoutes>;
```

2. Add a link to the Resource Optimization page in the side bar

```diff
// packages/app/src/components/Root/Root.tsx

+ import { ResourceOptimizationIconOutlined } from '@backstage-community/plugin-redhat-resource-optimization';

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon} to="catalog" text="Home" />
        <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
          <SidebarItem icon={MapIcon} to="tech-radar" text="Tech Radar" />
        </SidebarScrollWrapper>
+       <SidebarItem
+         icon={ResourceOptimizationIconOutlined}
+         to="/redhat-resource-optimization"
+         text="Optimizations"
+       />
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
```

#### Option 2: Dynamic plugin

This option describes how to install this plugin in Red Hat Developer Hub (RHDH).
It is advised to review the official documentation corresponding to your deployment.

1. Open Red Hat Developer Hub:
2. Navigate to the Helm Chart:
   - Go to the Helm tab in your **Red Hat OpenShift console**.
3. Edit the Helm Chart Values:
   - Include the plugin in the Helm chart values as shown in the example below:

```yaml
global:
  dynamic:
    plugins:
      - package: '@backstage-community/plugin-redhat-resource-optimization-dynamic@1.0.0'
        integrity: 'sha512-Qd8pniy1yRx+x7LnwjzQ6k9zP+C1yex24MaCcx7dGDPT/XbTokwoSZr4baSSn8jUA6P45NUUevu1d629mG4JGQ=='
      - package: '@backstage-community/plugin-redhat-resource-optimization-backend-dynamic@1.0.0'
        integrity: 'sha512-Q1d629mG4JGd8pniy1yRx+x7LnwjzQ6k9zP+C1yex24MaCcx7dGDPT/XbTokwoSZr4baSSn8jUA6P45NUUevud8pniy1yRQx=='
```

4. Include the below configuration in the `app-config.yaml` ConfigMap to setup the front-end side of the plugin

```yaml
dynamicPlugins:
  frontend:
    backstage-community.plugin-redhat-resource-optimization:
      appIcons:
        - name: resourceOptimizationIconOutlined
          importName: ResourceOptimizationIconOutlined
      routeBindings:
        targets:
          - name: resourceOptimizationPlugin
      dynamicRoutes:
        - path: /redhat-resource-optimization
          importName: ResourceOptimizationPage
          menuItem:
            icon: resourceOptimizationIconOutlined
            text: Optimizations
```

### Configuration

#### Step 1: Create a service account in Red Hat Hybrid Cloud Console (RHHCC)

The plugin consumes services from [Red Hat Hybrid Cloud Console](https://console.redhat.com/openshift/cost-management/optimizations), therefore your clusters must be registered in the Red Hat Hybrid Cloud Console and the service account you'll create must be assigned the `Cost OpenShift Viewer` role. Follow [this link](https://console.redhat.com/application-services/service-accounts) to learn more on how to create the service account.

#### Step 2: Update the `app-config.yaml`

The settings below the `proxy` key configure Backstage's internal proxy to make calls on-behalf of the service account to the upstream API.
Replace `${RHHCC_SA_CLIENT_ID}` and `${RHHCC_SA_CLIENT_SECRET}` in the snippet below with the credentials you obtained after creating the service account.

```yaml
# app-config.yaml

# Other config...

proxy:
  endpoints:
    '/cost-management/v1':
      target: https://console.redhat.com/api/cost-management/v1
      allowedHeaders: ['Authorization']
      # See: https://backstage.io/docs/releases/v1.28.0/#breaking-proxy-backend-plugin-protected-by-default
      credentials: dangerously-allow-unauthenticated

resourceOptimization:
  clientId: ${RHHCC_SA_CLIENT_ID}
  clientSecret: ${RHHCC_SA_CLIENT_SECRET}
```

### Contributing

- [License Apache 2.0](../../LICENSE.md)
- [DCO](../../DCO.md)
- Find more details in the [Resource Optimization back-end](../redhat-resource-optimization-backend/README.md) part of this plugin.
