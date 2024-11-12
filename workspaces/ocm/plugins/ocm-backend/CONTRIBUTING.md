# Setting up the development environment for OCM backend plugin

You can run a development setup using the following command:

```console
LEGACY_BACKEND_START=true yarn workspace @backstage-community/plugin-ocm-backend run start
```

When you run the previous command, the Kubernetes API is mocked to provide two clusters: `foo` (works as the hub) and `cluster1`. Also, an error response is mocked for non-existent clusters.

To view the data provided by the OCM backend, navigate to `http://localhost:7007/api/ocm/status`.
