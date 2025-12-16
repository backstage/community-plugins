# Argo CD plugin for Backstage

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/argocd/deployment-lifecycle](http://localhost:3000/argocd/deployment-lifecycle).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## For Administrators

### Installation and configuration

#### Prerequisites

Please install and configure the frontend and backend Kubernetes plugins by following the [installation](https://backstage.io/docs/features/kubernetes/installation/) and [configuration](https://backstage.io/docs/features/kubernetes/configuration/) guides.

### Argo CD backend

Please see [the backend documentation](../argocd-backend/README.md) for more information.

### [Optional] Enable Argo Rollouts feature

- Install the kubernetes backend plugin `@backstage/plugin-kubernetes-backend` and configure it by following the [installation](https://backstage.io/docs/features/kubernetes/installation/) and [configuration](https://backstage.io/docs/features/kubernetes/configuration/) guides.

- The following customResources component is added under the kubernetes configuration in the app-config.yaml file:

```
 kubernetes:
   ...
   customResources:
      - group: 'argoproj.io'
        apiVersion: 'v1alpha1'
        plural: 'rollouts'
      - group: 'argoproj.io'
        apiVersion: 'v1alpha1'
        plural: 'analysisruns'
```

- The [ClusterRole](https://backstage.io/docs/features/kubernetes/configuration/#role-based-access-control) must be granted for custom resources (Rollouts and AnalysisRuns) to ServiceAccount accessing the cluster.

- If you have the Backstage Kubernetes Plugin configured, then the ClusterRole is already granted.

You can use the following code to grant the ClusterRole for custom resources:

```
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
    name: backstage-read-only
  rules:
   - apiGroups:
      - argoproj.io
    resources:
      - rollouts
      - analysisruns
    verbs:
      - get
      - list
```

> Tip: You can use the [prepared manifest for a read-only ClusterRole](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/redhat-argocd/plugins/argocd/manifests/clusterrole.yaml), which provides access for both Kubernetes plugin and Argo CD plugin.

### Frontend-specific Configurations

By default this plugin removes duplicate entries being shown in the "Deployment history" section.
To view the full deployment history you set the following:

```yaml
argocd:
  fullDeploymentHistory: true # false by default
```

### Annotations

- The following annotation is added to the entity's `catalog-info.yaml` file to identify whether an entity contains the Kubernetes resources:

  ```yaml
  annotations:
    ...

    backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
  ```

  You can also add the `backstage.io/kubernetes-namespace` annotation to identify the Kubernetes resources using the defined namespace.

  ```yaml
  annotations:
    ...

    backstage.io/kubernetes-namespace: <RESOURCE_NS>
  ```

- A custom label selector can be added, which Backstage uses to find the Kubernetes resources. The label selector takes precedence over the ID annotations.

  ```yaml
  annotations:
    ...

    backstage.io/kubernetes-label-selector: 'app=my-app,component=front-end'
  ```

### Labels

- The following label is added to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

  ```yaml
  labels:
    ...

    backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>`
  ```

- To Map the Argo rollouts to a particular GitOps Application, the following label is added to the rollout resources:

  ```yaml
  labels:
    ...

    app.kubernetes.io/instance: <GITOPS_APPLCATION_NAME>`
  ```

  ***

  **NOTE**

  When using the label selector, the mentioned labels must be present on the resource.

  ***

## How to add Argo CD frontend plugin to Backstage app

1. Install the Argo CD plugin using the following command:

```bash
yarn workspace app add @backstage-community/plugin-redhat-argocd
```

2. Add deployment summary and deployment lifecycle compoennt to the `entityPage.tsx` source file:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  ArgocdDeploymentSummary,
  ArgocdDeploymentLifecycle,
  isArgocdConfigured,
} from '@backstage-community/plugin-redhat-argocd';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={e => Boolean(isArgocdConfigured(e))}>
        <Grid item sm={12}>
          <ArgocdDeploymentSummary />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
    ...
  </Grid>
);

const cicdcontent = (
  <EntitySwitch>
    {/* ... */}
    {/* highlight-add-start */}
    ...
    <EntitySwitch.Case if={e => Boolean(isArgocdConfigured(e))}>
      <Grid item sm={12}>
        <ArgocdDeploymentLifecycle />
      </Grid>
    </EntitySwitch.Case>
    {/* highlight-add-end */}
  </EntitySwitch>
);
```

- Add one of the following annotations to the entity's `catalog-info.yaml` file to enable Argo CD features in the backstage instance:

  - To get all the applications matching the metadata labels.

  ```yaml
  annotations:
    ...

    argocd/app-selector: 'rht-gitops.com/janus-argocd=quarkus-app' # format: `label.key=label.value`

  ```

      **or**

  - To fetch a single application, use the following annotation in `catalog-info.yaml` file:

  ```yaml
  annotations:
    ...

    argocd/app-name: 'quarkus-app'

  ```

  > [!Note] > **You should not add both the annotations in the same catalog, adding both annotations will result in error in the plugin.**

You can use these additional annotations with the base annotations:

- `argocd/project-name`: The name of the Application's project
- `argocd/app-namespace`: The namespace of the Application, supports a single namespace due to restrictions in the ArgoCD API. To query for applications across multiple namespaces, use the `argocd/app-selector` annotation.

- To switch between ArgoCD instances, you can use the following annotation

```yaml
 annotations:
   ...
    argocd/instance-name: 'argoInstance2'
```

- To fetch data from multiple ArgoCD instances, separate the instance names with commas. The order of displayed applications is determined by the order of instance names in this annotation. If it is missing, the order is determined by the order of instances in the configuration. Example configuration:

```yaml
 annotations:
   ...
    argocd/instance-name: 'argoInstance1,argoInstance2'
```

> [!Note]
> If `argocd/instance-name` annotation is not set, the plugin will search all available ArgoCD instances configured in the `app.config.yaml`. It is advised to add this annotation to entities for better performance.

> [!Important]
> Use `argocd/app-selector` to display multiple ArgoCD applications per entity. Annotation `argocd/app-name` is limited to returning the first application from each ArgoCD instance, this is necessary
> for compatibility with the [RoadieHQ ArgoCD Backend Plugin](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/plugins/backend/backstage-plugin-argo-cd-backend/README.md) that uses this annotation for 'single application' setup.
