#!/bin/bash
#
# Agentic Chat - MCP Server Configuration Generator
#
# This script generates configuration for the Kubernetes MCP Server:
# - OAuth/JWT token validation with Keycloak
# - Tool restrictions (read-only, disabled tools)
# - Resource blocking (Secrets, RBAC resources)
# - Kubernetes RBAC for the MCP ServiceAccount
#
# Tested with:
# - kubernetes-mcp-server v0.5.x+ (github.com/containers/kubernetes-mcp-server)
# - Kubernetes 1.28+
# - OpenShift 4.14+
#
# Usage:
#   source keycloak-config.env  # From step 1
#   ./03-mcp-server-config.sh
#
# Optional environment variables:
#   MCP_MODE          - Security mode: full, readonly, restricted (default: readonly)
#   MCP_NAMESPACE     - Kubernetes namespace for MCP server (default: mcp-system)
#   OUTPUT_DIR        - Output directory for generated files (default: .)
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-demo}"
MCP_CLIENT_ID="${MCP_CLIENT_ID:-mcp-server}"
MCP_CLIENT_SECRET="${MCP_CLIENT_SECRET:-}"
MCP_MODE="${MCP_MODE:-readonly}"
MCP_NAMESPACE="${MCP_NAMESPACE:-mcp-system}"
OUTPUT_DIR="${OUTPUT_DIR:-.}"

# Validate
validate_config() {
    if [ -z "$KEYCLOAK_URL" ]; then
        log_warn "KEYCLOAK_URL not set. OAuth will be disabled in generated config."
        log_warn "Source keycloak-config.env to enable OAuth configuration."
    fi
}

# Generate TOML configuration for MCP server
generate_mcp_config() {
    local mode="$1"
    local filename=""
    
    case "$mode" in
        full)
            filename="config.full.toml"
            log_info "Generating FULL ACCESS configuration (not recommended for production)..."
            ;;
        readonly)
            filename="config.readonly.toml"
            log_info "Generating READ-ONLY configuration (recommended)..."
            ;;
        restricted)
            filename="config.restricted.toml"
            log_info "Generating RESTRICTED WRITE configuration..."
            ;;
        *)
            log_error "Unknown mode: $mode"
            exit 1
            ;;
    esac
    
    cat > "${OUTPUT_DIR}/${filename}" << EOF
# Kubernetes MCP Server Configuration
# Mode: ${mode^^}
# Generated on $(date)
#
# Tested with:
# - kubernetes-mcp-server v0.5.x+
# - Keycloak 22.x, 24.x, 25.x
#
# Usage:
#   ./kubernetes-mcp-server --config ${filename}
#
# Or with environment variables:
#   export MCP_CONFIG=${filename}
#   ./kubernetes-mcp-server

# ============================================
# Server Settings
# ============================================

# Server port
port = "8080"

# Log verbosity (0-5)
log_level = 2

# SSE base URL (for reverse proxy setups)
# sse_base_url = "https://mcp.example.com"

# ============================================
# OAuth / JWT Authentication
# ============================================
EOF

    if [ -n "$KEYCLOAK_URL" ]; then
        cat >> "${OUTPUT_DIR}/${filename}" << EOF

# Enable OAuth authentication
require_oauth = true

# Keycloak authorization URL
authorization_url = "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}"

# Expected audience in JWT tokens
oauth_audience = "${MCP_CLIENT_ID}"

# Disable dynamic client registration (security hardening)
disable_dynamic_client_registration = true

# Token exchange settings (for advanced scenarios)
# sts_client_id = "${MCP_CLIENT_ID}"
# sts_client_secret = "YOUR_SECRET"
# sts_audience = "kubernetes"
# sts_scopes = ["openid", "profile"]
EOF
    else
        cat >> "${OUTPUT_DIR}/${filename}" << EOF

# OAuth disabled - set KEYCLOAK_URL to enable
require_oauth = false

# To enable OAuth, uncomment and configure:
# require_oauth = true
# authorization_url = "https://keycloak.example.com/realms/demo"
# oauth_audience = "mcp-server"
# disable_dynamic_client_registration = true
EOF
    fi

    cat >> "${OUTPUT_DIR}/${filename}" << EOF

# ============================================
# Tool Restrictions
# ============================================
EOF

    case "$mode" in
        full)
            cat >> "${OUTPUT_DIR}/${filename}" << EOF

# FULL ACCESS MODE - All tools enabled
# WARNING: Not recommended for production!

read_only = false
disable_destructive = false
enabled_tools = []
disabled_tools = []
EOF
            ;;
        readonly)
            cat >> "${OUTPUT_DIR}/${filename}" << EOF

# READ-ONLY MODE - Only read operations allowed
# Recommended for most production deployments

read_only = true
disable_destructive = true

# Only these tools are available in read-only mode:
# - list_resources
# - get_resource
# - get_pod_logs
# - get_events
# - list_api_resources
# - get_cluster_info

enabled_tools = []
disabled_tools = []
EOF
            ;;
        restricted)
            cat >> "${OUTPUT_DIR}/${filename}" << EOF

# RESTRICTED WRITE MODE - Allow some writes, block dangerous operations

read_only = false
disable_destructive = true

# Explicitly disabled tools
disabled_tools = [
    "delete_resource",      # Block all deletions
    "exec_command",         # Block pod exec
    "port_forward",         # Block port forwarding
    "drain_node",           # Block node operations
    "cordon_node",
    "uncordon_node"
]

# Leave empty to allow all non-disabled tools
enabled_tools = []
EOF
            ;;
    esac

    cat >> "${OUTPUT_DIR}/${filename}" << EOF

# ============================================
# Resource Blocking
# ============================================

# Block access to sensitive Kubernetes resources
# These resources cannot be read, listed, or modified through MCP

# Secrets - contain sensitive data
[[denied_resources]]
group = ""
version = "v1"
kind = "Secret"

# RBAC resources - prevent privilege escalation
[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRole"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "ClusterRoleBinding"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "Role"

[[denied_resources]]
group = "rbac.authorization.k8s.io"
version = "v1"
kind = "RoleBinding"

# ServiceAccounts - prevent identity manipulation
[[denied_resources]]
group = ""
version = "v1"
kind = "ServiceAccount"

# Nodes - prevent infrastructure access
[[denied_resources]]
group = ""
version = "v1"
kind = "Node"

# ============================================
# Cluster Provider
# ============================================

# Use in-cluster config (when running in Kubernetes)
cluster_provider_strategy = "in-cluster"

# Or use kubeconfig (for local development)
# cluster_provider_strategy = "kubeconfig"
# kubeconfig = "/path/to/kubeconfig"

# ============================================
# Server Instructions (for AI agents)
# ============================================

server_instructions = """
This is a Kubernetes MCP server for LSS.
EOF

    case "$mode" in
        readonly)
            cat >> "${OUTPUT_DIR}/${filename}" << 'EOF'
You have READ-ONLY access to the cluster. You can:
- List and describe resources
- View pod logs
- View events
- Describe API resources

You CANNOT modify, create, or delete any resources.
"""
EOF
            ;;
        restricted)
            cat >> "${OUTPUT_DIR}/${filename}" << 'EOF'
You have RESTRICTED access to the cluster. You can:
- List and describe resources
- View pod logs and events
- Create and update resources (deployments, services, configmaps)
- Scale deployments

You CANNOT:
- Delete resources
- Access Secrets, RBAC resources, or ServiceAccounts
- Execute commands in pods
- Perform node operations
"""
EOF
            ;;
        full)
            cat >> "${OUTPUT_DIR}/${filename}" << 'EOF'
You have FULL access to the cluster. Be careful with destructive operations.
Always confirm with the user before deleting or modifying critical resources.
"""
EOF
            ;;
    esac

    log_success "Generated: ${OUTPUT_DIR}/${filename}"
}

# Generate Kubernetes RBAC for MCP ServiceAccount
generate_kubernetes_rbac() {
    log_info "Generating Kubernetes RBAC resources..."
    
    cat > "${OUTPUT_DIR}/mcp-server-rbac.yaml" << EOF
# Kubernetes RBAC for MCP Server
# Generated on $(date)
#
# This creates:
# - Namespace for MCP server
# - ServiceAccount
# - ClusterRole with appropriate permissions
# - ClusterRoleBinding
#
# Apply with:
#   kubectl apply -f mcp-server-rbac.yaml
#
# Tested with:
# - Kubernetes 1.28+
# - OpenShift 4.14+

---
apiVersion: v1
kind: Namespace
metadata:
  name: ${MCP_NAMESPACE}
  labels:
    app.kubernetes.io/name: mcp-server
    app.kubernetes.io/component: infrastructure

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-server
  namespace: ${MCP_NAMESPACE}
  labels:
    app.kubernetes.io/name: mcp-server

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-server-readonly
  labels:
    app.kubernetes.io/name: mcp-server
rules:
  # Core resources - read only
  - apiGroups: [""]
    resources:
      - pods
      - pods/log
      - services
      - endpoints
      - namespaces
      - configmaps
      - persistentvolumeclaims
      - persistentvolumes
      - events
      - resourcequotas
      - limitranges
    verbs: ["get", "list", "watch"]
  
  # Apps resources - read only
  - apiGroups: ["apps"]
    resources:
      - deployments
      - daemonsets
      - statefulsets
      - replicasets
    verbs: ["get", "list", "watch"]
  
  # Batch resources - read only
  - apiGroups: ["batch"]
    resources:
      - jobs
      - cronjobs
    verbs: ["get", "list", "watch"]
  
  # Networking - read only
  - apiGroups: ["networking.k8s.io"]
    resources:
      - ingresses
      - networkpolicies
    verbs: ["get", "list", "watch"]
  
  # Storage - read only
  - apiGroups: ["storage.k8s.io"]
    resources:
      - storageclasses
    verbs: ["get", "list", "watch"]
  
  # Autoscaling - read only
  - apiGroups: ["autoscaling"]
    resources:
      - horizontalpodautoscalers
    verbs: ["get", "list", "watch"]
  
  # Custom resources discovery
  - apiGroups: ["apiextensions.k8s.io"]
    resources:
      - customresourcedefinitions
    verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-server-write
  labels:
    app.kubernetes.io/name: mcp-server
rules:
  # Write permissions for non-sensitive resources
  # Only bind this if you need write access
  
  # Deployments - scale and update
  - apiGroups: ["apps"]
    resources:
      - deployments
      - deployments/scale
      - statefulsets
      - statefulsets/scale
    verbs: ["get", "list", "watch", "update", "patch"]
  
  # ConfigMaps - create and update
  - apiGroups: [""]
    resources:
      - configmaps
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  
  # Services - create and update
  - apiGroups: [""]
    resources:
      - services
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  
  # Jobs - create
  - apiGroups: ["batch"]
    resources:
      - jobs
    verbs: ["get", "list", "watch", "create"]

---
# Bind read-only role (always apply this)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: mcp-server-readonly
  labels:
    app.kubernetes.io/name: mcp-server
subjects:
  - kind: ServiceAccount
    name: mcp-server
    namespace: ${MCP_NAMESPACE}
roleRef:
  kind: ClusterRole
  name: mcp-server-readonly
  apiGroup: rbac.authorization.k8s.io

---
# Bind write role (only apply if you need write access)
# Uncomment the following to enable write permissions:
#
# apiVersion: rbac.authorization.k8s.io/v1
# kind: ClusterRoleBinding
# metadata:
#   name: mcp-server-write
#   labels:
#     app.kubernetes.io/name: mcp-server
# subjects:
#   - kind: ServiceAccount
#     name: mcp-server
#     namespace: ${MCP_NAMESPACE}
# roleRef:
#   kind: ClusterRole
#   name: mcp-server-write
#   apiGroup: rbac.authorization.k8s.io
EOF

    log_success "Generated: ${OUTPUT_DIR}/mcp-server-rbac.yaml"
}

# Generate Kubernetes Deployment
generate_deployment() {
    log_info "Generating Kubernetes deployment..."
    
    cat > "${OUTPUT_DIR}/mcp-server-deployment.yaml" << EOF
# Kubernetes Deployment for MCP Server
# Generated on $(date)
#
# Apply with:
#   kubectl apply -f mcp-server-deployment.yaml
#
# Prerequisites:
#   - Apply mcp-server-rbac.yaml first
#   - Create ConfigMap with config.toml
#
# Tested with:
# - kubernetes-mcp-server v0.5.x+
# - Kubernetes 1.28+

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-server-config
  namespace: ${MCP_NAMESPACE}
  labels:
    app.kubernetes.io/name: mcp-server
data:
  # Paste your config.toml content here
  # Or mount from a file
  config.toml: |
    # See config.readonly.toml for full configuration
    require_oauth = ${KEYCLOAK_URL:+true}${KEYCLOAK_URL:-false}
EOF

    if [ -n "$KEYCLOAK_URL" ]; then
        cat >> "${OUTPUT_DIR}/mcp-server-deployment.yaml" << EOF
    authorization_url = "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}"
    oauth_audience = "${MCP_CLIENT_ID}"
EOF
    fi

    cat >> "${OUTPUT_DIR}/mcp-server-deployment.yaml" << EOF
    read_only = true
    disable_destructive = true
    
    [[denied_resources]]
    group = ""
    version = "v1"
    kind = "Secret"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
  namespace: ${MCP_NAMESPACE}
  labels:
    app.kubernetes.io/name: mcp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: mcp-server
  template:
    metadata:
      labels:
        app.kubernetes.io/name: mcp-server
    spec:
      serviceAccountName: mcp-server
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: mcp-server
          image: quay.io/strimzi-ci/kubernetes-mcp-server:latest
          imagePullPolicy: Always
          args:
            - "--config=/etc/mcp-server/config.toml"
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
            readOnlyRootFilesystem: true
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          volumeMounts:
            - name: config
              mountPath: /etc/mcp-server
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: mcp-server-config

---
apiVersion: v1
kind: Service
metadata:
  name: mcp-server
  namespace: ${MCP_NAMESPACE}
  labels:
    app.kubernetes.io/name: mcp-server
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: mcp-server
  ports:
    - name: http
      port: 8080
      targetPort: http
      protocol: TCP
EOF

    log_success "Generated: ${OUTPUT_DIR}/mcp-server-deployment.yaml"
}

# Generate local development script
generate_local_dev_script() {
    log_info "Generating local development script..."
    
    cat > "${OUTPUT_DIR}/run-mcp-local.sh" << 'EOF'
#!/bin/bash
#
# Run MCP Server locally for development
#
# Prerequisites:
#   - Go 1.21+ or pre-built binary
#   - kubectl configured with cluster access
#   - Keycloak running (optional, for OAuth)
#
# Usage:
#   ./run-mcp-local.sh [config-file]
#

set -e

CONFIG_FILE="${1:-config.readonly.toml}"
MCP_PORT="${MCP_PORT:-8080}"

# Check if binary exists
if ! command -v kubernetes-mcp-server &> /dev/null; then
    echo "kubernetes-mcp-server not found in PATH"
    echo ""
    echo "Install options:"
    echo "  1. Download from https://github.com/containers/kubernetes-mcp-server/releases"
    echo "  2. Build from source: go install github.com/containers/kubernetes-mcp-server@latest"
    echo ""
    exit 1
fi

# Check kubeconfig
if ! kubectl cluster-info &> /dev/null; then
    echo "Cannot connect to Kubernetes cluster"
    echo "Configure kubectl first: kubectl config use-context your-context"
    exit 1
fi

echo "Starting MCP Server..."
echo "  Config: ${CONFIG_FILE}"
echo "  Port: ${MCP_PORT}"
echo "  Cluster: $(kubectl config current-context)"
echo ""

kubernetes-mcp-server \
    --config "${CONFIG_FILE}" \
    --port "${MCP_PORT}" \
    --cluster-provider-strategy kubeconfig
EOF

    chmod +x "${OUTPUT_DIR}/run-mcp-local.sh"
    log_success "Generated: ${OUTPUT_DIR}/run-mcp-local.sh"
}

# Print summary
print_summary() {
    echo ""
    echo "============================================"
    echo "  MCP SERVER CONFIGURATION COMPLETE"
    echo "============================================"
    echo ""
    echo "Generated files:"
    echo ""
    echo "Configuration files (choose one):"
    echo "  - config.readonly.toml    : Read-only mode (recommended)"
    echo "  - config.restricted.toml  : Restricted write mode"
    echo "  - config.full.toml        : Full access (not for production)"
    echo ""
    echo "Kubernetes resources:"
    echo "  - mcp-server-rbac.yaml    : RBAC for MCP ServiceAccount"
    echo "  - mcp-server-deployment.yaml: Deployment and Service"
    echo ""
    echo "Development:"
    echo "  - run-mcp-local.sh        : Run MCP server locally"
    echo ""
    echo "Deployment steps:"
    echo ""
    echo "  1. Apply RBAC:"
    echo "     kubectl apply -f mcp-server-rbac.yaml"
    echo ""
    echo "  2. Update ConfigMap with your config.toml:"
    echo "     kubectl create configmap mcp-server-config \\"
    echo "       --from-file=config.toml=config.readonly.toml \\"
    echo "       -n ${MCP_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
    echo ""
    echo "  3. Deploy MCP server:"
    echo "     kubectl apply -f mcp-server-deployment.yaml"
    echo ""
    echo "  4. Verify:"
    echo "     kubectl get pods -n ${MCP_NAMESPACE}"
    echo "     kubectl logs -n ${MCP_NAMESPACE} -l app.kubernetes.io/name=mcp-server"
    echo ""
    echo "For local development:"
    echo "  ./run-mcp-local.sh config.readonly.toml"
    echo ""
    echo "Next steps:"
    echo "  - Validate setup: ./04-validate-setup.sh"
}

# Main
main() {
    echo "============================================"
    echo "  LSS - MCP Server Config Generator"
    echo "============================================"
    echo ""
    
    validate_config
    
    mkdir -p "$OUTPUT_DIR"
    
    # Generate all configuration modes
    generate_mcp_config "readonly"
    generate_mcp_config "restricted"
    generate_mcp_config "full"
    
    # Generate Kubernetes resources
    generate_kubernetes_rbac
    generate_deployment
    generate_local_dev_script
    
    print_summary
    
    log_success "MCP server configuration generation completed!"
}

main "$@"

