# Setting up the development environment for Jfrog Artifactory plugin

New Frontend System (default). `yarn start` uses mock catalog and Artifactory data, so you can exercise the plugin without a backend:

```console
yarn workspace @backstage-community/plugin-jfrog-artifactory run start
```

Legacy frontend system:

```console
yarn workspace @backstage-community/plugin-jfrog-artifactory run start:legacy
```
