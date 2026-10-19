# Setting up the development environment for Topology plugin

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Topology plugin is a front-end plugin.

Testing of the New Frontend System (NFS) and the legacy frontend system (OFS) is done in plugin **dev mode**. There is no `packages/app` or `packages/backend` in this workspace.

To start a live development session, first follow the Prerequisites steps in the [README](./README.md#Prerequisites) file. Specifically, you will need to update the `kubernetes` section in your [`app-config.yaml`](../../app-config.yaml) file to point to an actual Kubernetes cluster.

If you are using an OpenShift cluster, you can use an OpenShift API token instead of a `serviceAccountToken` for development purposes. The API token can be found in the OpenShift console under the user profile dropdown menu:

![The OpenShift console user profile dropdown menu](https://i.imgur.com/LpJl7ZD.png)

You will find the API token and API url needed to connect to the OpenShift cluster by clicking on the `Copy Login Command` button.

Then, from the workspace root:

```console
cd workspaces/topology
yarn install
```

### New frontend system (default)

```console
yarn start
```

This starts the NFS plugin (`dev/index.tsx`) together with the lightweight Topology backend.

Mock data (no cluster required):

```console
yarn workspace @backstage-community/plugin-topology start:mock
```

### Legacy frontend system

```console
yarn start:legacy
```

This starts the OFS plugin (`dev/legacy.tsx`) together with the same backend.

Mock data:

```console
yarn workspace @backstage-community/plugin-topology start:legacy:mock
```

The mock entrypoints provide mock Kubernetes data so you can see the Topology graph without a real cluster. To view live data from an actual Kubernetes cluster, you will need to [add annotations to your Kubernetes resources](./README.md#Entity%20annotation%2Flabel).
