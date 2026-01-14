#!/bin/bash
set -e

echo "=== Starting Minikube ==="
minikube start --memory=4096 --cpus=2


echo "=== Creating namespaces ==="
kubectl create namespace argocd || echo "Namespace argocd already exists"
kubectl create namespace demo-apps || echo "Namespace demo-apps already exists"

echo "=== Installing ArgoCD ==="
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "=== Waiting for ArgoCD pods to exist ==="
# Wait until at least one pod exists
while [ $(kubectl get pods -n argocd --no-headers 2>/dev/null | wc -l) -eq 0 ]; do
  echo "Waiting for pods to be created..."
  sleep 5
done

echo "=== Waiting for all ArgoCD pods to be Running ==="
timeout=600
interval=5
elapsed=0

while true; do
  not_running=$(kubectl get pods -n argocd --no-headers | awk '{print $3}' | grep -v '^Running$' || true)
  if [ -z "$not_running" ]; then
    echo "All ArgoCD pods are running!"
    break
  fi
  if [ $elapsed -ge $timeout ]; then
    echo "Timeout reached, some pods are not running yet:"
    kubectl get pods -n argocd
    exit 1
  fi
  echo "Waiting for pods to be running..."
  sleep $interval
  elapsed=$((elapsed + interval))
done

echo "=== Waiting for argocd-server pod to be ready ==="
# Wait for the server pod to be Running and Ready
while true; do
  status=$(kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound")
  ready=$(kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
  if [ "$status" == "Running" ] && [ "$ready" == "true" ]; then
    echo "argocd-server pod is ready!"
    break
  fi
  echo "Waiting for argocd-server pod to be ready (status=$status, ready=$ready)..."
  sleep 5
done

echo "=== Deploying sample applications ==="
kubectl apply -f https://raw.githubusercontent.com/redhat-appstudio/rhtap-backstage-plugins/refs/heads/main/development/configuration/argocd/argocd-apps.yml

echo "=== Retrieving ArgoCD initial admin password ==="
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "Decoded admin password: $ARGOCD_PASSWORD"

echo
echo "=== Backstage app-config.local.yaml snippet ==="
cat <<EOF
argocd:
  localDevelopment: true
  username: admin
  password: $ARGOCD_PASSWORD
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: local
          url: https://localhost:53204
          insecure: true
EOF

echo
echo "=== Backstage entity YAML snippet ==="
cat <<EOF
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: argocd-basic-app
  annotations:
    argocd/app-name: basic-app
    argocd/namespace: demo-apps
spec:
  type: service
  lifecycle: experimental
  owner: guests
  system: examples
EOF

echo
echo "=== Starting port-forward for ArgoCD server (press Ctrl+C to stop) ==="
echo "This must stay running for Backstage to access ArgoCD."
kubectl port-forward svc/argocd-server -n argocd 53204:443
