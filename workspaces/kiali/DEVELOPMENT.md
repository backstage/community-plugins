# Development environment

## Full Setup

1. Configure you `app-config.local.yaml` with kiali configuration

   ```yaml
   catalog:
     providers:
       # highlight-add-start
       kiali:
         # Required. Kiali endpoint
         url: ${KIALI_ENDPOINT}
         # Optional. Required by token authentication
         serviceAccountToken: ${KIALI_SERVICE_ACCOUNT_TOKEN}
         # Optional. defaults false
         skipTLSVerify: true
         # Optional. defaults kiali-token-Kubernetes
         tokenName: 'kiali-token-Kubernetes'
         # Optional
         caData: ${KIALI_CONFIG_CA_DATA}
         # Optional. Local path to CA file
         caFile: ''
         # Optional. Time in seconds that session is enabled, defaults to 1 minute.
         sessionTime: 60
         # highlight-add-end
   ```

2. Run

```bash
    export KIALI_BASE_URL=https://kiali-istio-system.apps-crc.testing;`
    yarn start
```

## Configure auth

### Token authentication

1. Set the parameters in app-config.local.yaml

   ```yaml
   catalog:
     providers:
       # highlight-add-start
       kiali:
         # Required. Kiali endpoint
         url: ${KIALI_ENDPOINT}
         # Optional. Required by token authentication
         serviceAccountToken: ${KIALI_SERVICE_ACCOUNT_TOKEN}
         # Optional. defaults false
         skipTLSVerify: true
         # Optional
   ```

2. To get `KIALI_SERVICE_ACCOUNT_TOKEN` create your service account and create the token

   ```bash
   kubectl create token $KIALI_SERVICE_ACCOUNT
   ```

   or if you installed kiali with the operator then execute

   ```bash
   export KIALI_SERVICE_ACCOUNT_TOKEN=$(kubectl describe secret $(kubectl get secret -n istio-system | grep kiali-service-account-token | cut -d" " -f1) -n istio-system | grep token: | cut -d ":" -f2 | sed 's/^ *//')
   ```
