#!/bin/bash

# Force script to stop on error
set -e

# Additional debugging info
set -x

# Step 1: Check if the namespace exists and delete it if present
if oc get ns local-backstage; then
  oc delete ns local-backstage --wait=true
fi


# Step 2: Install dependencies and build projects
yarn && yarn run tsc && yarn run build:all

# Step 3: Export and package dynamic plugins
DYNAMIC_PLUGIN_ROOT_DIR=./deploy
mkdir -p $DYNAMIC_PLUGIN_ROOT_DIR

echo "Export dynamic plugins..."

cd plugins/mta-backend
npx -y @janus-idp/cli@^1.11.1 package export-dynamic-plugin --clean
cd ../..

cd plugins/mta-frontend
npx -y @janus-idp/cli@^1.11.1 package export-dynamic-plugin --clean --in-place
cd ../..

cd plugins/catalog-backend-module-mta-entity-provider
npx -y @janus-idp/cli@^1.13.0 package export-dynamic-plugin --no-embed-as-dependencies
cd ../..

cd plugins/scaffolder-backend-module-mta
npx -y @janus-idp/cli@^1.13.0 package export-dynamic-plugin --no-embed-as-dependencies
cd ../..

echo "Dynamic plugins exported"

echo "Packaging up plugin static assets"
MTA_BACKEND_INTEGRITY_HASH=$(npm pack plugins/mta-backend/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "mta-backend plugin integrity Hash: $MTA_BACKEND_INTEGRITY_HASH"

MTA_FRONTEND_INTEGRITY_HASH=$(npm pack plugins/mta-frontend/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "mta-frontend plugin integrity Hash: $MTA_FRONTEND_INTEGRITY_HASH"

CATALOG_BACKEND_MODULE_INTEGRITY_HASH=$(npm pack plugins/catalog-backend-module-mta-entity-provider/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "Catalog module plugin integrity Hash: $CATALOG_BACKEND_MODULE_INTEGRITY_HASH"

SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH=$(npm pack plugins/scaffolder-backend-module-mta/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "Scaffolder module plugin integrity Hash: $SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH"


echo "Plugin .tgz files:"
ls -l $DYNAMIC_PLUGIN_ROOT_DIR

# Step 6: Recreate namespace
oc create ns local-backstage
oc project local-backstage

# Step 7: Create the dynamic-plugins-rhdh ConfigMap
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
      - package: 'http://plugin-registry:8080/backstage-community-backstage-plugin-mta-backend-dynamic-0.1.1.tgz'
        disabled: false
        integrity: '$MTA_BACKEND_INTEGRITY_HASH'
      - package: 'http://plugin-registry:8080/backstage-community-backstage-plugin-mta-frontend-dynamic-0.1.1.tgz'
        disabled: false
        integrity: '$MTA_FRONTEND_INTEGRITY_HASH'
      - package: 'http://plugin-registry:8080/backstage-community-backstage-plugin-catalog-backend-module-mta-entity-provider-dynamic-0.1.1.tgz'
        disabled: false
        integrity: '$CATALOG_BACKEND_MODULE_INTEGRITY_HASH'
      - package: 'http://plugin-registry:8080/backstage-community-backstage-plugin-scaffolder-backend-module-mta-dynamic-0.1.1.tgz'
        disabled: false
        integrity: '$SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH'
EOF

# Step 8: Execute additional setup scripts and apply Kubernetes resources
./02-create-plugin-registry.sh
oc apply -f app-config-rhdh.yaml
oc apply -f backstage-operator-cr.yaml
