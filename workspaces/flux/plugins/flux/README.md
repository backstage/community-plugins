# Flux plugin for Backstage

The Flux plugin for Backstage provides views of [Flux](https://fluxcd.io/) resources available in Kubernetes clusters.

<!-- This URL is a complete path so that it shows up in the NPM package -->

![EntityFluxSourcesCard](https://raw.githubusercontent.com/weaveworks/weaveworks-backstage/main/plugins/backstage-plugin-flux/sources_card.png)

## Content

The plugin provides several [`Cards`](https://backstage.io/docs/plugins/composability#naming-patterns) for composing your Portal.

All cards use the Backstage Kubernetes ["common label"](https://backstage.io/docs/features/kubernetes/configuration#common-backstageiokubernetes-id-label) to identify Flux resources for the current entity.

These Cards provide unified views of their resources.

- EntityFluxDeploymentsCard - Displays associated Kustomizations and HelmReleases
- EntityFluxSourcesCard - Displays associated GitRepositories, OCIRepositories and HelmRepositories

You can also add cards for resources with the following components, each of these shows specific resources associated to the Entity.

- EntityFluxHelmReleasesCard
- EntityFluxKustomizationsCard
- EntityFluxGitRepositoriesCard
- EntityFluxOCIRepositoriesCard
- EntityFluxHelmRepositoriesCard
- EntityFluxImagePoliciesCard

The plugin also provides a page for viewing the Flux runtime state across your clusters, and a Card if you would prefer to include it some other page you have instead.

- FluxRuntimePage
- FluxRuntimeCard

As with other Backstage plugins, you can compose the UI you need.

## Prerequisite

The Kubernetes plugins including `@backstage/plugin-kubernetes` and `@backstage/plugin-kubernetes-backend` are to be installed and configured by following the installation and configuration [guides](https://backstage.io/docs/features/kubernetes/installation/#adding-the-kubernetes-frontend-plugin).

After they are installed, make sure to import the frontend plugin by adding the "Kubernetes" tab wherever needed.

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityKubernetesContent,
  isKubernetesAvailable,
} from '@backstage/plugin-kubernetes';

// You can add the tab to any number of pages, the service page is shown as an example here
const serviceEntityPage = (
  <EntityLayout>
    {/* other tabs... */}
    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

If you are using the [`config`](https://backstage.io/docs/features/kubernetes/configuration#config) method for configuring your clusters, and connecting using a `ServiceAccount`, you will need to bind the `ServiceAccount` to the `ClusterRole` `flux-view-flux-system` that is created with these [permissions](https://github.com/fluxcd/flux2/blob/44d69d6fc0c353e79c1bad021a4aca135033bce8/manifests/rbac/view.yaml) by Flux.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: backstage-cluster-view-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: flux-view-flux-system
subjects:
  - kind: ServiceAccount
    name: backstage # replace with the name of the SA that your Backstage runs as
    namespace: flux-system
```

The "sync", "suspend/resume" button requires additional permissions, it implements same functionality as [flux reconcile](https://fluxcd.io/flux/cmd/flux_reconcile/) for resources.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: patch-flux-resources
rules:
  - apiGroups:
      - source.toolkit.fluxcd.io
    resources:
      - buckets
      - helmcharts
      - gitrepositories
      - helmrepositories
      - ocirepositories
    verbs:
      - patch
  - apiGroups:
      - kustomize.toolkit.fluxcd.io
    resources:
      - kustomizations
    verbs:
      - patch
  - apiGroups:
      - helm.toolkit.fluxcd.io
    resources:
      - helmreleases
    verbs:
      - patch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: backstage-patch-flux-resources-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: patch-flux-resources
subjects:
  - kind: ServiceAccount
    name: backstage # replace with the name of the SA that your Backstage runs as
    namespace: flux-system
```

## Installation

Install the plugin dependency in your Backstage app package:

```bash
# From your Backstage root directory
yarn workspace app add @backstage-community/plugin-flux
```

## Configuration

The Flux plugins provide several different Cards, which are composable into your Backstage App.

1. Add the card to your app EntityPage.tsx

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import { EntityFluxHelmReleasesCard } from '@backstage-community/plugin-flux';

// You can add the tab to any number of pages, the service page is shown as an
// example here
const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    // ...
    <Grid item md={4} xs={12}>
      <EntityFluxHelmReleasesCard />
    </Grid>
    // ...
  </Grid>
);
```

The card has a `many` property which is `true` by default. If your card table is likely to have just a few items, you can switch this to `false` to hide the filtering, searching and pagination options in the card table.

```tsx
<Grid item md={4} xs={12}>
  <EntityFluxHelmReleasesCard many={false} />
</Grid>
```

2. Add a page to your app EntityPage.tsx

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityFluxHelmReleasesCard,
  EntityFluxGitRepositoriesCard,
  EntityFluxOCIRepositoriesCard,
  EntityFluxHelmRepositoriesCard,
} from '@backstage-community/plugin-flux';

const serviceEntityPage = (
  <EntityLayout>
    // ...
    <Grid container spacing={3} alignItems="stretch">
      <Grid item md={12}>
        <EntityFluxHelmReleasesCard />
      </Grid>
      <Grid item md={12}>
        <EntityFluxHelmRepositoriesCard />
      </Grid>
      <Grid item md={12}>
        <EntityFluxGitRepositoriesCard />
      </Grid>
      <Grid item md={12}>
        <EntityFluxOCIRepositoriesCard />
      </Grid>
    </Grid>
    // ...
  </EntityLayout>
);
```

3. Add the [backstage.io/kubernetes-id](https://backstage.io/docs/features/kubernetes/configuration/#common-backstageiokubernetes-id-label) to your Backstage entity.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: carts-service
  description: A microservices-demo service that provides shopping carts for users
  tags:
    - java
  annotations:
    backstage.io/kubernetes-id: carts-service
spec:
  type: service
  lifecycle: production
  owner: sockshop-team
  system: carts
```

4. Label your Flux HelmRelease with the correct label:

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: carts-nginx
  namespace: carts
  labels:
    backstage.io/kubernetes-id: carts-service
spec:
  chart:
    spec:
      chart: nginx
      reconcileStrategy: ChartVersion
      sourceRef:
        kind: HelmRepository
        name: podinfo
  interval: 1m0s
```

5. [Optional] Configure linking through to Weave GitOps and availability of actions on resources (sync/suspend/resume), configure your `app-config.yaml`

If you have [Weave GitOps](https://www.weave.works/product/gitops/) or [Weave GitOps Enterprise](https://www.weave.works/product/gitops-enterprise/) you can configure the plugins to link through to the UI which will provide more information on the resources.

This will generate link URLs through to the relevant UIs relative to the configured URL, for example to view Helm Repositories, this would generate a URL that looks like this `https://wego.example.com/wego/helm_repo/details?clusterName=demo-cluster&name=podinfo&namespace=default`.

```yaml
# app-config.yaml
flux:
  gitops:
    baseUrl: https://wego.example.com
```

**NOTE:** The URL generated will include the name of the cluster that is configured in Backstage's cluster location mechanism.

```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: https://192.168.0.1:8000
          name: Default
          authProvider: 'serviceAccount'
          skipTLSVerify: true
          skipMetricsLookup: true
          serviceAccountToken: ABC123
          caData: LS0tLS1CRUdJTiBDRVJUSUZJQ0...
```

For example, this would generate a link to the `Default` cluster.

If you want to link to Weave GitOps Enterprise, you will need to provide the
name and namespace of the cluster you want to query, for example:

```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: https://192.168.0.1:8000
          name: test-ns/name
          authProvider: 'serviceAccount'
          skipTLSVerify: true
          skipMetricsLookup: true
          serviceAccountToken: ABC123
          caData: LS0tLS1CRUdJTiBDRVJUSUZJQ0...
```

You can also update the configuration to restrict the access to the sync/suspend/resume of resources. To do this, simple set readOnly to true.

```yaml
# app-config.yaml
flux:
  gitops:
    readOnly: true
```

The UI will reflect this by showing the buttons corresponding to sync/suspend/resume as disabled.
Enabling readOnly mode disables the buttons in the UI and provides feedback to the user that resources cannot be changed. However this is only part of a full readOnly solution. The [Backstage Kubernetes Proxy](https://backstage.io/docs/features/kubernetes/proxy/) should be configured to deny users from changing resources and/or the ServiceAccount that Backstage uses to access the cluster should be limited to only have read permissions.

6. [Optional] Add a Flux Runtime page to your app

- An example Page is included as the `<FluxRuntimePage />` component.
- Add the page to your app by first adding a route in `App.tsx`

```tsx
// In packages/app/src/App.tsx
import { FluxRuntimePage } from '@backstage-community/plugin-flux';

// ...

const routes = (
  <FlatRoutes>
    ...
    <Route path="/flux-runtime" element={<FluxRuntimePage >} />
  </FlatRoutes>
);
```

- Add the page to the navigation bar:

```tsx
// In packages/app/src/components/Root/Root.tsx

import { FluxIcon } from '@backstage-community/plugin-flux';

// ...

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        ...
        <SidebarScrollWrapper>
          <SidebarItem icon={FluxIcon} to="flux-runtime" text="Flux Runtime" />
        </SidebarScrollWrapper>
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
```

## Verification

For the resources where we display a Verification status, if the Flux resource
has no verification configured, the column will be blank.

<!-- This URL is a complete path so that it shows up in the NPM package -->

![Verification status for resources](https://raw.githubusercontent.com/weaveworks/weaveworks-backstage/main/plugins/backstage-plugin-flux/verification.png)

You can configure verification for the following resources:

- [Git Repositories](https://fluxcd.io/flux/components/source/gitrepositories/#verification)
- [OCI Repositories](https://fluxcd.io/flux/components/source/ocirepositories/#verification)

## Debugging

If you are seeing this error.

```
Request failed with 401 Unauthorized, {"error":{"name":"AuthenticationError","message":"No Backstage token"},"request":{"method":"POST","url":"/api/kubernetes/resources/custom/query"},"response":{"statusCode":401}}
```

This is likely caused by this issue in [Backstage](https://github.com/backstage/backstage/issues/12394).

The simplest thing to do is put some sort of authentication in front of your Backstage setup, for example using the [GitHub Authentication Provider](https://backstage.io/docs/auth/github/provider/) this will ensure there's an authentication token available.
