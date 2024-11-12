# Setting up the development environment for Quay plugin

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Quay plugin is a front-end plugin. However, it requires a backend proxy to be available at all times. Therefore, you need to run a backend instance in the development environment as well.

You can run the following commands concurrently from the root repository to start a live development session:

```console
yarn start-backend
```

```console
yarn workspace @backstage-community/plugin-quay run start
```
