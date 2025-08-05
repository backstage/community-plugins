# Setting up the development environment for Topology plugin

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Topology plugin is a front-end plugin.

To start a live development session for the Topology plugin, first follow the Prerequisites steps in the [README](./README.md#Prerequisites) file. Specifically, you will need to update the `kubernetes` section in your [`app-config.yaml`](../../app-config.yaml) file to point to an actual Kubernetes cluster.

If you are using an OpenShift cluster, you can use an OpenShift API token instead of a `serviceAccountToken` for development purposes. The API token can be found in the OpenShift console under the user profile dropdown menu:

![The OpenShift console user profile dropdown menu](https://i.imgur.com/LpJl7ZD.png)

You will find the API token and API url needed to connect to the OpenShift cluster by clicking on the `Copy Login Command` button.

Then, to start the Backstage development session, you need to run the following commands from the repository root:

```console
cd workspaces/topology
yarn install
yarn start
```

You will notice that when running the Backstage development session with mock data, the Topology tab will not show any data. To view live data from a Kubernetes cluster using the toplology plugin, you will need to [add annotations to your Kubernetes resources](./README.md#Entity%20annotation%2Flabel). Once added, you should be able to see the data in the Topology tab.
