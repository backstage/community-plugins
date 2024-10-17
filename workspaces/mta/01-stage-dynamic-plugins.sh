#!/bin/bash

# Uses "npm pack" to create .tgz files containing the plugin static assets
DYNAMIC_PLUGIN_ROOT_DIR=./deploy
echo ""
echo "Packaging up plugin static assets"
echo ""

# Force script to stop on error
# set -e

# Additional debugging info
# set -x

MTA_BACKEND_INTEGRITY_HASH=$(npm pack plugins/mta-backend/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "mta-backend plugin integrity Hash: $MTA_BACKEND_INTEGRITY_HASH"

MTA_FRONTEND_INTEGRITY_HASH=$(npm pack plugins/mta-frontend/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "mta-frontend plugin integrity Hash: $MTA_FRONTEND_INTEGRITY_HASH"

CATALOG_BACKEND_MODULE_INTEGRITY_HASH=$(npm pack plugins/catalog-backend-module-mta-entity-provider/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "Catalog module plugin integrity Hash: $CATALOG_BACKEND_MODULE_INTEGRITY_HASH"

SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH=$(npm pack plugins/scaffolder-backend-module-mta/dist-dynamic --pack-destination $DYNAMIC_PLUGIN_ROOT_DIR --json | jq -r '.[0].integrity')
echo "Scaffolder module plugin integrity Hash: $SCAFFOLDER_BACKEND_MODULE_INTEGRITY_HASH"


echo ""
echo "Plugin .tgz files:"
ls -l $DYNAMIC_PLUGIN_ROOT_DIR
echo ""
