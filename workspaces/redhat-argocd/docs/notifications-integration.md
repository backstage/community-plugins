# ArgoCD Notifications Integration with Backstage

This guide explains how to configure ArgoCD to send notifications directly to the Backstage Notifications plugin when application sync events occur.

## Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    Kubernetes / OpenShift Cluster                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                         ArgoCD                              │   │
│  │  ┌─────────────────┐     ┌────────────────────────────────┐ │   │
│  │  │ Your App        │────▶│ Notifications Controller       │ │   │
│  │  │ (with annotations)    │                                │ │   │
│  │  └─────────────────┘     └───────────────┬────────────────┘ │   │
│  └──────────────────────────────────────────┼──────────────────┘   │
└─────────────────────────────────────────────┼──────────────────────┘
                                              │ Webhook POST
                                              │ (with auth token)
                                              ▼
                    ┌────────────────────────────────────────────┐
                    │              Backstage                     │
                    │  Endpoint: /api/notifications/notifications│
                    │  ──────────────────────────────────────────│
                    │  Shows notifications to users in the UI    │
                    └────────────────────────────────────────────┘
```

## Prerequisites

- ArgoCD installed with the notifications controller enabled
- Backstage with the Notifications plugin installed
- Network connectivity from ArgoCD to Backstage

---

## Part 1: Backstage Configuration

### Step 1: Install the Notifications Plugin

Add the notifications plugin to your Backstage backend:

```bash
# Backend
yarn --cwd packages/backend add @backstage/plugin-notifications-backend

# Frontend
yarn --cwd packages/app add @backstage/plugin-notifications
```

### Step 2: Register the Backend Plugins

In `packages/backend/src/index.ts`:

```typescript
// Add notifications support
backend.add(import('@backstage/plugin-notifications-backend'));
```

### Step 3: Add the Frontend Components

In `packages/app/src/App.tsx`:

```typescript
import { NotificationsPage } from '@backstage/plugin-notifications';

// Add route
<Route path="/notifications" element={<NotificationsPage />} />;
```

In `packages/app/src/components/Root/Root.tsx`:

```typescript
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';

// Add to sidebar
<NotificationsSidebarItem />;
```

### Step 4: Configure External Access Token

In your `app-config.yaml`, configure a static token for ArgoCD to authenticate:

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${ARGOCD_NOTIFICATION_TOKEN} # Set this environment variable
          subject: argocd-notifications
```

> **Security Note:** In production, use a strong, randomly generated token and store it securely.

---

## Part 2: ArgoCD Configuration

### Step 1: Enable the Notifications Controller

For OpenShift GitOps:

```bash
oc patch argocd openshift-gitops -n openshift-gitops --type merge -p '
{
  "spec": {
    "notifications": {
      "enabled": true
    }
  }
}'
```

For standard ArgoCD, ensure the notifications controller is deployed.

### Step 2: Create the Notifications Secret

Store the Backstage authentication token:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-notifications-secret
  namespace: openshift-gitops # or argocd
type: Opaque
stringData:
  backstage-token: 'your-secret-token-here' # Must match ARGOCD_NOTIFICATION_TOKEN
```

Apply it:

```bash
kubectl apply -f argocd-notifications-secret.yaml
```

### Step 3: Configure Notifications

> **Important for OpenShift GitOps Users:** The OpenShift GitOps operator manages the `argocd-notifications-cm` ConfigMap. If you edit the ConfigMap directly, your changes may be overwritten. Instead, use the `NotificationsConfiguration` Custom Resource (CR) as shown below.

#### Option A: For OpenShift GitOps

Use the `NotificationsConfiguration` Custom Resource:

> **📝 Note: This is a Customizable Template**
>
> The configuration below is a starting template that you can customize to fit your needs:
>
> - **Add triggers**: You can add more triggers for other events (e.g., `app.status.sync.status == 'Unknown'`, `app.status.health.status == 'Healthy'`, `app.status.health.status == 'Missing'`, sync running, etc.)
> - **Remove triggers**: Feel free to remove any triggers you don't need
> - **Customize templates**: Modify the notification titles, descriptions, severity levels, and topics to match your organization's preferences
> - **Adjust conditions**: Modify the `when` expressions to fine-tune when notifications are sent
>
> For a complete list of available trigger conditions and variables, see the [ArgoCD Notifications Triggers documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/triggers/).

```bash
# Get your ArgoCD URL first
ARGOCD_URL=$(oc get routes -n openshift-gitops openshift-gitops-server -o jsonpath='https://{.spec.host}')
BACKSTAGE_URL="https://your-backstage-url.com"

oc apply -n openshift-gitops -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: NotificationsConfiguration
metadata:
  name: default-notifications-configuration
  namespace: openshift-gitops
spec:
  # Context provides variables available in templates
  context:
    argocdUrl: ${ARGOCD_URL}

  # Webhook service configuration
  services:
    service.webhook.backstage: |
      url: ${BACKSTAGE_URL}/api/notifications/notifications
      headers:
      - name: Content-Type
        value: application/json
      - name: Authorization
        value: Bearer \$backstage-token

  # Notification templates
  # Note: We use custom names with '-backstage' suffix to avoid conflicts with default templates
  templates:
    template.app-sync-succeeded-backstage: |
      webhook:
        backstage:
          method: POST
          body: |
            {
              "recipients": {
                "type": "entity",
                "entityRef": "{{index .app.metadata.annotations "backstage.io/entity-ref"}}"
              },
              "payload": {
                "title": "{{.app.metadata.name}} - Sync Succeeded",
                "description": "Application **{{.app.metadata.name}}** has been synced successfully.\n\n**Health:** {{.app.status.health.status}}\n**Revision:** {{.app.status.sync.revision}}",
                "link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
                "severity": "low",
                "topic": "argocd.sync.succeeded"
              }
            }

    template.app-sync-failed-backstage: |
      webhook:
        backstage:
          method: POST
          body: |
            {
              "recipients": {
                "type": "entity",
                "entityRef": "{{index .app.metadata.annotations "backstage.io/entity-ref"}}"
              },
              "payload": {
                "title": "{{.app.metadata.name}} - Sync Failed",
                "description": "Application **{{.app.metadata.name}}** sync has failed.\n\n**Phase:** {{.app.status.operationState.phase}}\n**Message:** {{.app.status.operationState.message}}",
                "link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
                "severity": "high",
                "topic": "argocd.sync.failed"
              }
            }

    template.app-health-degraded-backstage: |
      webhook:
        backstage:
          method: POST
          body: |
            {
              "recipients": {
                "type": "entity",
                "entityRef": "{{index .app.metadata.annotations "backstage.io/entity-ref"}}"
              },
              "payload": {
                "title": "{{.app.metadata.name}} - Health Degraded",
                "description": "Application **{{.app.metadata.name}}** health has degraded.\n\n**Status:** {{.app.status.health.status}}",
                "link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
                "severity": "high",
                "topic": "argocd.health.degraded"
              }
            }

    template.app-deployed-backstage: |
      webhook:
        backstage:
          method: POST
          body: |
            {
              "recipients": {
                "type": "entity",
                "entityRef": "{{index .app.metadata.annotations "backstage.io/entity-ref"}}"
              },
              "payload": {
                "title": "{{.app.metadata.name}} - Deployed",
                "description": "Application **{{.app.metadata.name}}** has been successfully deployed and is healthy.",
                "link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
                "severity": "low",
                "topic": "argocd.deployed"
              }
            }

  triggers:
    trigger.on-sync-succeeded-backstage: |
      - when: app.status.operationState.phase in ['Succeeded']
        send: [app-sync-succeeded-backstage]

    trigger.on-sync-failed-backstage: |
      - when: app.status.operationState.phase in ['Error', 'Failed']
        send: [app-sync-failed-backstage]

    trigger.on-health-degraded-backstage: |
      - when: app.status.health.status == 'Degraded'
        send: [app-health-degraded-backstage]

    trigger.on-deployed-backstage: |
      - when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
        send: [app-deployed-backstage]
EOF
```

#### Option B: For Standard ArgoCD

For non-OpenShift installations, you can edit the ConfigMap directly:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  # Context for template variables
  context: |
    argocdUrl: https://your-argocd-url.com

  # Webhook service configuration
  service.webhook.backstage: |
    url: https://your-backstage-url.com/api/notifications/notifications
    headers:
      - name: Content-Type
        value: application/json
      - name: Authorization
        value: Bearer $backstage-token

  # ... Templates - same as above
```

Apply it:

```bash
kubectl apply -f argocd-notifications-cm.yaml
```

---

## Part 3: Enable Notifications for Your Application

### Add Required Annotations to Your ArgoCD Application

Each ArgoCD Application that should send notifications needs two things:

1. **The Backstage entity reference** - tells ArgoCD which Backstage entity should receive notifications
2. **Trigger subscriptions** - tells ArgoCD which events to notify about

> **Important:** The subscription annotation format is `notifications.argoproj.io/subscribe.<trigger-name>.<service>`. The trigger name must match exactly what you configured (with the `-backstage` suffix).

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-application
  namespace: openshift-gitops
  annotations:
    # 1. Map to Backstage entity (REQUIRED)
    backstage.io/entity-ref: 'component:default/my-application'

    # 2. Subscribe to notification triggers (add the ones you want)
    notifications.argoproj.io/subscribe.on-sync-succeeded-backstage.backstage: ''
    notifications.argoproj.io/subscribe.on-sync-failed-backstage.backstage: ''
    notifications.argoproj.io/subscribe.on-health-degraded-backstage.backstage: ''
    notifications.argoproj.io/subscribe.on-deployed-backstage.backstage: ''
spec:
  # ... your application spec
```

---

## Example: Complete Setup Flow

### Scenario

You have a service called `order-service` managed by ArgoCD, and you want the team to receive Backstage notifications on sync events.

### 1. Backstage Catalog Entity

```yaml
# order-service/catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: order-service
  description: Order processing service
  annotations:
    argocd/app-selector: 'app.kubernetes.io/instance=order-service'
spec:
  type: service
  owner: team-orders
  lifecycle: production
```

### 2. ArgoCD Application

```yaml
# argocd/order-service-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service
  namespace: openshift-gitops
  annotations:
    # Link to Backstage entity
    backstage.io/entity-ref: 'component:default/order-service'
    # Subscribe to notifications (note the -backstage suffix in trigger names)
    notifications.argoproj.io/subscribe.on-deployed-backstage.backstage: ''
    notifications.argoproj.io/subscribe.on-sync-failed-backstage.backstage: ''
    notifications.argoproj.io/subscribe.on-health-degraded-backstage.backstage: ''
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/order-service
    targetRevision: main
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: order-service
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 3. What Happens

1. **Developer pushes code** → ArgoCD detects change and syncs
2. **Sync succeeds** → ArgoCD notifications controller fires `on-deployed-backstage` trigger
3. **Webhook sent** → POST to Backstage `/api/notifications/notifications`
4. **Notification appears** → Team sees "🚀 order-service - Deployed" in Backstage with a link to ArgoCD

---

## Troubleshooting

### Notifications Not Appearing

1. **Check notifications controller is running:**

   ```bash
   kubectl get pods -n openshift-gitops | grep notification
   ```

2. **Check controller logs for errors:**

   ```bash
   kubectl logs -n openshift-gitops -l app.kubernetes.io/name=argocd-notifications-controller --tail=50
   ```

3. **Check logs for backstage-related messages:**

   ```bash
   kubectl logs -n openshift-gitops deployment/openshift-gitops-notifications-controller --tail=50 | grep -i backstage
   ```

4. **Verify webhook service is configured:**

   ```bash
   kubectl get configmap argocd-notifications-cm -n openshift-gitops -o jsonpath='{.data.service\.webhook\.backstage}'
   ```

5. **Verify annotations on application:**
   ```bash
   kubectl get application my-app -n openshift-gitops -o jsonpath='{.metadata.annotations}' | jq .
   ```

### "notification service 'backstage' is not supported"

This error means the webhook service is not configured. Common causes:

1. **OpenShift GitOps:** You edited the ConfigMap directly instead of using `NotificationsConfiguration` CR. The operator overwrites ConfigMap changes.
2. **Missing service configuration:** The `service.webhook.backstage` key is not in the ConfigMap.

**Solution:** Use the `NotificationsConfiguration` CR for OpenShift GitOps (see Part 2).

### Webhook Returns 400 Bad Request / "not valid JSON"

This means the trigger is using the wrong template format (text instead of JSON). Common causes:

1. **Template name conflicts:** Using names like `template.app-sync-succeeded` that conflict with ArgoCD defaults (which use email/message format, not webhook).
2. **Wrong subscription:** Application is subscribed to the default trigger instead of your custom one.

**Solution:** Use custom template/trigger names with a suffix like `-backstage`:

- Template: `template.app-sync-succeeded-backstage`
- Trigger: `trigger.on-sync-succeeded-backstage`
- Subscription: `notifications.argoproj.io/subscribe.on-sync-succeeded-backstage.backstage`

### Link Shows "<no value>" or Broken URL

The `{{.context.argocdUrl}}` template variable is not configured.

**Solution:** Add the context configuration:

For OpenShift GitOps:

```bash
ARGOCD_URL=$(oc get routes -n openshift-gitops openshift-gitops-server -o jsonpath='https://{.spec.host}')
oc patch notificationsconfiguration default-notifications-configuration -n openshift-gitops --type=merge -p "
spec:
  context:
    argocdUrl: $ARGOCD_URL
"
```

For standard ArgoCD, add to ConfigMap:

```yaml
data:
  context: |
    argocdUrl: https://your-argocd-url.com
```

### Authentication Errors

If you see `401 Unauthorized` or token errors:

1. Verify the token in `argocd-notifications-secret` matches your Backstage config
2. Check the Authorization header format: `Bearer $backstage-token`
3. Restart the notifications controller after secret changes:
   ```bash
   kubectl rollout restart deployment -n openshift-gitops -l app.kubernetes.io/name=argocd-notifications-controller
   ```

---

## Security Considerations

1. **Use strong tokens** - Generate random tokens with sufficient entropy
2. **Rotate tokens periodically** - Update both ArgoCD secret and Backstage config
3. **Use HTTPS** - Ensure Backstage is accessible over HTTPS in production
4. **Network policies** - Consider restricting which pods can reach Backstage

---

## Additional Resources

- [ArgoCD Notifications Documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/)
- [Backstage Notifications Plugin](https://backstage.io/docs/notifications/)
- [ArgoCD Webhook Service Configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/services/webhook/)
