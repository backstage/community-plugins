# Welcome to Argo CD plugin workspace

To start local ArgoCD with demo applications, run:

```sh
yarn install
yarn start:argocd
```

- **Requirements**: Minikube
- The [script](./scripts/start-argocd.sh) installs local ArgoCD pre-configured with demo applications. These applications are
  registered using [example entities](./examples/entities.yaml) defined within ArgoCD workspace.
  Script prints out ArgoCD credentials.

To configure ArgoCD application, add ArgoCD instance information in `app.config.yaml`.
For local development, you can use this configuration:

```
argocd:
  namespacedApps: true
  localDevelopment: true
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: local
          url: https://localhost:53204
          username: ${ARGOCD_USERNAME}
          password: ${ARGOCD_PASSWORD}
```

To start the app, run:

```sh
yarn install
yarn start
```

Follow these links to learn more about this plugin:

1. [Frontend](./plugins/argocd/README.md)
2. [Backend](./plugins/argocd-backend/README.md)
3. [Common](./plugins/argocd-common/README.md)
