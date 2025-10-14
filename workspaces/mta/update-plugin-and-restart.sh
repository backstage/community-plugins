#!/bin/bash

# Script to update MTA plugin image URLs and restart RHDH
# Usage: ./update-plugin-and-restart.sh [NAMESPACE]

set -e
set -x

# Default values
DEFAULT_NAMESPACE="local-backstage"
DEFAULT_CONFIGMAP="dynamic-plugins-rhdh"
DEFAULT_DEPLOYMENT="backstage-developer-hub"

# Parse arguments
NAMESPACE="${1:-$DEFAULT_NAMESPACE}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [NAMESPACE]"
    echo ""
    echo "Examples:"
    echo "  $0                         # Update MTA plugins in default namespace"
    echo "  $0 my-namespace            # Update in different namespace"
    echo ""
    echo "Current MTA plugin URLs:"
    if oc get configmap "$DEFAULT_CONFIGMAP" -n "$DEFAULT_NAMESPACE" -o jsonpath='{.data.dynamic-plugins\.yaml}' 2>/dev/null | grep -q "mta"; then
        oc get configmap "$DEFAULT_CONFIGMAP" -n "$DEFAULT_NAMESPACE" -o jsonpath='{.data.dynamic-plugins\.yaml}' 2>/dev/null | grep "mta" | sed 's/.*package: /  /'
    else
        echo "  (configmap not found or no MTA plugins configured)"
    fi
}

# Check if namespace exists
if ! oc get namespace "$NAMESPACE" >/dev/null 2>&1; then
    echo "Error: Namespace '$NAMESPACE' does not exist"
    exit 1
fi

# Check if configmap exists
if ! oc get configmap "$DEFAULT_CONFIGMAP" -n "$NAMESPACE" >/dev/null 2>&1; then
    echo "Error: ConfigMap '$DEFAULT_CONFIGMAP' does not exist in namespace '$NAMESPACE'"
    exit 1
fi

echo "🔄 Updating all MTA plugins..."
echo "  Namespace: $NAMESPACE"
echo ""

# Update the configmap with hardcoded plugin URLs
cat <<EOF | oc apply -f -
kind: ConfigMap
apiVersion: v1
metadata:
  name: $DEFAULT_CONFIGMAP
  namespace: $NAMESPACE
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
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-mta-backend:pr_1493__0.5.1!backstage-plugin-mta-backend'
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-mta-frontend:pr_1493__0.4.0!backstage-community-backstage-plugin-mta-frontend'
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-catalog-backend-module-mta-entity-provider:pr_1493__0.4.0!backstage-community-backstage-plugin-catalog-backend-module-mta-entity-provider'
      - disabled: false
        package: 'oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-backstage-plugin-scaffolder-backend-module-mta:pr_1493__0.5.0!backstage-community-backstage-plugin-scaffolder-backend-module-mta'
EOF

echo "✅ ConfigMap updated successfully"

# Verify the update
echo ""
echo "🔍 Verifying update..."
echo "Updated MTA plugin URLs:"
oc get configmap "$DEFAULT_CONFIGMAP" -n "$NAMESPACE" -o jsonpath='{.data.dynamic-plugins\.yaml}' | grep "mta" | sed 's/.*package: /  /'

# Restart the deployment
echo ""
echo "🔄 Restarting RHDH deployment..."
oc rollout restart deployment "$DEFAULT_DEPLOYMENT" -n "$NAMESPACE"

echo "✅ Deployment restart initiated"

# Wait and monitor the rollout
echo ""
echo "⏳ Monitoring rollout status..."
oc rollout status deployment "$DEFAULT_DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

echo ""
echo "🎉 Plugin update and restart completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Check pod logs: oc logs -f deployment/$DEFAULT_DEPLOYMENT -n $NAMESPACE"
echo "  2. Monitor init container: oc logs -f deployment/$DEFAULT_DEPLOYMENT -c install-dynamic-plugins -n $NAMESPACE"
echo "  3. Check RHDH UI for plugin functionality"