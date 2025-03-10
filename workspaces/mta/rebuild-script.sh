#!/bin/bash

# Force script to stop on error
set -e

# Additional debugging info
set -x

# Step 1: Check if the namespace exists and delete it if present
if oc get ns local-backstage; then
  oc delete ns local-backstage --wait=true
fi

# Step 2: Install dependencies and build the project
yarn && yarn run tsc && yarn run build:all

# Step 3: Export dynamic plugins
# (Retaining the original cli versions you used)
echo "Exporting dynamic plugins..."
cd plugins/mta-backend
npx -y @janus-idp/cli@^1.11.1 package export-dynamic-plugin --clean
cd ../..

cd plugins/mta-frontend
npx -y @janus-idp/cli@^1.11.1 package export-dynamic-plugin --clean
cd ../..

cd plugins/catalog-backend-module-mta-entity-provider
npx -y @janus-idp/cli@^1.13.0 package export-dynamic-plugin --no-embed-as-dependencies
cd ../..

cd plugins/scaffolder-backend-module-mta
npx -y @janus-idp/cli@^1.13.0 package export-dynamic-plugin --no-embed-as-dependencies
cd ../..

echo "Dynamic plugins exported."

# Step 4: Package dynamic plugins and gather integrity hashes
DYNAMIC_PLUGIN_ROOT_DIR=./deploy
mkdir -p "$DYNAMIC_PLUGIN_ROOT_DIR"

# Define a function to fetch the current version from package.json
get_version() {
  jq -r '.version' "$1/package.json"
}

# Fetch the versions dynamically from package.json
MTA_BACKEND_VERSION=$(get_version plugins/mta-backend)
MTA_FRONTEND_VERSION=$(get_version plugins/mta-frontend)
CATALOG_BACKEND_MODULE_VERSION=$(get_version plugins/catalog-backend-module-mta-entity-provider)
SCAFFOLDER_BACKEND_MODULE_VERSION=$(get_version plugins/scaffolder-backend-module-mta)

# Create .tgz packages and capture integrity hashes
MTA_BACKEND_INTEGRITY_HASH=$(
  npm pack plugins/mta-backend/dist-dynamic \
    --pack-destination "$DYNAMIC_PLUGIN_ROOT_DIR" \
    --json | jq -r '.[0].integrity'
)
MTA_FRONTEND_INTEGRITY_HASH=$(
  npm pack plugins/mta-frontend/dist-dynamic \
    --pack-destination "$DYNAMIC_PLUGIN_ROOT_DIR" \
    --json | jq -r '.[0].integrity'
)
CATALOG_BACKEND_MODULE_INTEGRITY_HASH=$(
  npm pack plugins/catalog-backend-module-mta-entity-provider/dist-dynamic \
    --pack-destination "$DYNAMIC_PLUGIN_ROOT_DIR" \
    --json | jq -r '.[0].integrity'
)
SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH=$(
  npm pack plugins/scaffolder-backend-module-mta/dist-dynamic \
    --pack-destination "$DYNAMIC_PLUGIN_ROOT_DIR" \
    --json | jq -r '.[0].integrity'
)

# Construct the plugin package URLs with dynamic versions
MTA_BACKEND_PACKAGE_URL="http://plugin-registry:8080/backstage-community-backstage-plugin-mta-backend-dynamic-$MTA_BACKEND_VERSION.tgz"
MTA_FRONTEND_PACKAGE_URL="http://plugin-registry:8080/backstage-community-backstage-plugin-mta-frontend-dynamic-$MTA_FRONTEND_VERSION.tgz"
CATALOG_BACKEND_MODULE_PACKAGE_URL="http://plugin-registry:8080/backstage-community-backstage-plugin-catalog-backend-module-mta-entity-provider-dynamic-$CATALOG_BACKEND_MODULE_VERSION.tgz"
SCAFFOLDER_BACKEND_MODULE_PACKAGE_URL="http://plugin-registry:8080/backstage-community-backstage-plugin-scaffolder-backend-module-mta-dynamic-$SCAFFOLDER_BACKEND_MODULE_VERSION.tgz"

echo "Plugins packaged. Integrity hashes obtained."

echo "Plugin .tgz files in $DYNAMIC_PLUGIN_ROOT_DIR:"
ls -l "$DYNAMIC_PLUGIN_ROOT_DIR"

# Step 5: Recreate the namespace and apply the ConfigMap
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
      - package: '$MTA_BACKEND_PACKAGE_URL'
        disabled: false
        integrity: '$MTA_BACKEND_INTEGRITY_HASH'
      - package: '$MTA_FRONTEND_PACKAGE_URL'
        disabled: false
        integrity: '$MTA_FRONTEND_INTEGRITY_HASH'
      - package: '$CATALOG_BACKEND_MODULE_PACKAGE_URL'
        disabled: false
        integrity: '$CATALOG_BACKEND_MODULE_INTEGRITY_HASH'
      - package: '$SCAFFOLDER_BACKEND_MODULE_PACKAGE_URL'
        disabled: false
        integrity: '$SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH'
EOF

# Step 6: Execute additional setup scripts and apply Kubernetes resources
./02-create-plugin-registry.sh
oc apply -f app-config-rhdh.yaml
oc apply -f backstage-operator-cr.yaml
