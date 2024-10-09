# Setting up the development environment for Jfrog Artifactory plugin

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires backend proxy to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```console
yarn start-backend
```

```console
yarn workspace @backstage-community/plugin-jfrog-artifactory run start
```
