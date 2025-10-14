#!/bin/bash

# Force script to stop on error
set -e

# Additional debugging info
set -x

# Step 1: Check if the namespace exists and delete it if present
if oc get ns local-backstage; then
  oc delete ns local-backstage --wait=true
fi

# Step 2: Recreate the namespace and apply the ConfigMap
oc create ns local-backstage
oc project local-backstage

cat <<EOF | oc apply -f -
kind: ConfigMap
apiVersion: v1
metadata:
  name: dynamic-plugins-rhdh
  namespace: local-backstage
  labels:
    rhdh.redhat.com/ext-config-sync: 'true'
  annotations:
    rhdh.redhat.com/backstage-name: 'developer-hub'
data:
  dynamic-plugins.yaml: |
    includes:
      - dynamic-plugins.default.yaml
    plugins:
      - disabled: false
        package: ./dynamic-plugins/dist/backstage-plugin-catalog-backend-module-github-dynamic
      - disabled: false
        package: ./dynamic-plugins/dist/backstage-plugin-catalog-backend-module-github-org-dynamic
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-mta-backend:pr_1493__0.5.1!backstage-community-backstage-plugin-mta-backend'
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-mta-frontend:pr_1493__0.4.0!backstage-community-backstage-plugin-mta-frontend'
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-catalog-backend-module-mta-entity-provider:pr_1493__0.4.0!backstage-community-backstage-plugin-catalog-backend-module-mta-entity-provider'
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-scaffolder-backend-module-mta:pr_1493__0.5.0!backstage-community-backstage-plugin-scaffolder-backend-module-mta'
EOF

# Step 3: Apply Kubernetes resources
oc apply -f github-secret.yaml
oc apply -f app-config-rhdh-configmap.yaml
oc apply -f backstage-operator-cr.yaml