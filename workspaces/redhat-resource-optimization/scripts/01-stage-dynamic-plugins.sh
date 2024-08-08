#!/bin/bash

PLUGIN_ID="redhat-resource-optimization"
PLUGIN_REGISTRY_URL="${PLUGIN_REGISTRY_URL:-"http://plugin-registry:8080"}"

yarn install
yarn build:all
yarn export-dynamic

# Uses "npm pack" to to create .tgz files containing the plugin static assets
DYNAMIC_PLUGIN_ROOT_DIR="./dynamic-plugins-root"
if [[ ! -d $DYNAMIC_PLUGIN_ROOT_DIR ]]; then
    mkdir $DYNAMIC_PLUGIN_ROOT_DIR
fi

echo ""
echo "Packaging up plugin artifacts"
BACKEND_INTEGRITY_HASH=$(npm pack plugins/$PLUGIN_ID-backend/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
FRONTEND_INTEGRITY_HASH=$(npm pack plugins/$PLUGIN_ID/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
BACKEND_ARTIFACT_NAME="$(ls -1 $DYNAMIC_PLUGIN_ROOT_DIR | sed -n 1p)"
FRONTEND_ARTIFACT_NAME="$(ls -1 $DYNAMIC_PLUGIN_ROOT_DIR | sed -n 2p)"

if [[ $? -eq 0 ]]; then
    echo "
👍 Add this to your dynamic-plugins configuration:

plugins:
  - package: '$PLUGIN_REGISTRY_URL/$BACKEND_ARTIFACT_NAME'
    disabled: false
    integrity: '$BACKEND_INTEGRITY_HASH'
  - package: '$PLUGIN_REGISTRY_URL/$FRONTEND_ARTIFACT_NAME'
    disabled: false
    integrity: '$FRONTEND_INTEGRITY_HASH'
"
else
    echo "👎 Something went wrong..."
    exit $?
fi