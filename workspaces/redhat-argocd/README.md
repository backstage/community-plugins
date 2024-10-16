# Welcome to Argo CD plugin workspace

To configure the argocd application, add argocd instance information in `app.config.yaml`

```
argocd:
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argoInstance1.com
          username: ${ARGOCD_USERNAME}
          password: ${ARGOCD_PASSWORD}
```

To start the app, run:

```sh
yarn install
yarn start:backstage
```

Follow these links to learn more about this plugin:

1. [Frontend](./plugins/redhat-argocd/README.md)

2. [Common](./plugins/redhat-argocd-common/README.md)
