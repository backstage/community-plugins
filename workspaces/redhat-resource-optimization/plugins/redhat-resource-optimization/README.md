# Resource Optimization

Welcome to the Resource Optimization plugin!

Based on [Project Koku](https://github.com/project-koku/koku), the Resource Optimization plugin allows users to visualize usage trends and receive optimization recommendations for workloads running on OpenShift clusters.

## Getting started

The plugin consumes services from [Red Hat Hybrid Cloud Console](https://console.redhat.com/openshift/cost-management/optimizations), therefore your clusters [must be configured to receive optimization recommendations](https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html-single/getting_started_with_resource_optimization_for_openshift/index).  
To get started, [create a service account](https://console.redhat.com/application-services/service-accounts) and assign it the `Cost OpenShift Viewer` role from the Red Hat Hybrid Cloud Console.

### Setup

You can follow one of these options depending on your environment and how you choose to deploy Backstage.

#### Option 1: Static plugin

1. Add the dependencies

   ```sh
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-redhat-resource-optimization
   yarn --cwd packages/backend add @backstage-community/plugin-redhat-resource-optimization-backend
   ```

1. Update your `app-config.yaml` file

   ```yaml
   # app-config.yaml

   proxy:
     endpoints:
       '/cost-management/v1':
         target: https://console.redhat.com/api/cost-management/v1
         allowedHeaders: ['Authorization']
         # See: https://backstage.io/docs/releases/v1.28.0/#breaking-proxy-backend-plugin-protected-by-default
         credentials: dangerously-allow-unauthenticated

   # Replace `${RHHCC_SA_CLIENT_ID}` and `${RHHCC_SA_CLIENT_SECRET}` with the service account credentials.
   resourceOptimization:
     clientId: ${RHHCC_SA_CLIENT_ID}
     clientSecret: ${RHHCC_SA_CLIENT_SECRET}
   ```

1. Add the back-end plugin to `packages/backend/src/index.ts`

   ```ts
   backend.add(
     import('@backstage-community/plugin-redhat-resource-optimization-backend'),
   );
   ```

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

1. Add a link to the Resource Optimization page in the side bar

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

Unlike static plugins that necessitate source code modifications, dynamic plugins can be seamlessly integrated through configuration entries in the `app-config.yaml` file.
Red Hat Developer Hub (RHDH) leverages dynamic plugins to efficiently deploy plugins on a Backstage instance.

The procedure involves the following steps:

1. First and foremost, you must follow [these instructions](https://github.com/janus-idp/backstage-showcase/blob/main/docs/dynamic-plugins/export-derived-package.md) to understand how to export this plugin as a dynamic plugin.
1. Ensure you are familiar with the [RHDH configuration docs](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.3/html/administration_guide_for_red_hat_developer_hub/assembly-add-custom-app-file-openshift_admin-rhdh#proc-add-custom-app-config-file-ocp-operator_admin-rhdh)
1. Specially, make sure you have configured

   - ConfigMaps: `app-config-rhdh`, `dynamic-plugins-rhdh`
   - Secrets: `secrets-rhdh`

1. Add the following configuration to each one of the objects mentioned above respectively

   ```yaml
   # Add to secrets-rhdh Secret

   RHHCC_SA_CLIENT_ID: # <as base64 string>
   RHHCC_SA_CLIENT_SECRET: # <as base64 string>
   ```

   ```yaml
   # Add to app-config-rhdh ConfigMap

   proxy:
     endpoints:
       '/cost-management/v1':
         target: https://console.redhat.com/api/cost-management/v1
         allowedHeaders: ['Authorization']
         credentials: dangerously-allow-unauthenticated
     resourceOptimization:
       clientId: '${RHHCC_SA_CLIENT_ID}'
       clientSecret: '${RHHCC_SA_CLIENT_SECRET}'
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

   ```yaml
   # Add to dynamic-plugins-rhdh ConfigMap

   kind: ConfigMap
   apiVersion: v1
   metadata # <omitted>
   data:
     dynamic-plugins.yaml: |
       includes:
         - dynamic-plugins.default.yaml
       plugins:
         - package: '@marek.libra/plugin-redhat-resource-optimization-dynamic@1.0.1'
           integrity: 'sha512-w53eSjMAUmKG2nwYeq+6B63qPeAqmSz2C4NsBaMleV4A8ST05yht/UK2pgHJTpxtLo0CYSq/+plR3s47xhO0aQ=='
           disabled: false
         - package: '@marek.libra/plugin-redhat-resource-optimization-backend-dynamic@1.0.0'
           integrity: 'sha512-ndhUnXGJUdLX1FubdCW/I8uE5oq5I0f/R/dSNGsCqD6Y/Uvcja5y8DE8W8hI+t2GnnEttuxehmjTBbjAT7sQRQ=='
           disabled: false
   ```

### Contributing

- [License Apache 2.0](../../LICENSE.md)
- [DCO](../../DCO.md)
- Find more details in the [Resource Optimization back-end](../redhat-resource-optimization-backend/README.md) part of this plugin.
