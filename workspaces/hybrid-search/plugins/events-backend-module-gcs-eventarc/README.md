# GCS Eventarc Events Ingress Backend Module for Backstage (`@backstage-community/plugin-events-backend-module-gcs-eventarc`)

This custom backend module implements a webhook ingress point that listens to Google Cloud Storage (GCS) object finalize events via Google Eventarc, automatically triggering incremental ingestion into Google Vertex AI Search.

---

## ⚡ Ingestion Workflow

```mermaid
sequenceDiagram
    autonumber
    participant GCS as GCS Storage Bucket
    participant EA as Google Eventarc (Trigger)
    participant FWD as GKE Managed Eventarc Forwarder Pod
    participant BS as Backstage Webhook Ingress (/api/events/gcs)
    participant VAI as Vertex AI Search (Discovery Engine)

    Note over GCS: File search_index.json finalized
    GCS-->>EA: Trigger event (object.v1.finalized)
    EA->>FWD: Publish Event to managed Pub/Sub Topic
    Note over FWD: Forwarder Pod pulls from Pub/Sub
    FWD->>BS: Private HTTP POST (Service port 80 -> Pod port 7007)
    Note over BS: Webhook verifies Google OIDC Signature
    BS->>BS: Publish 'gcs-notifications' to Internal Event Bus
    BS->>VAI: Trigger Bulk Document Ingestion (INCREMENTAL)
    BS->>GCS: Fetch previous version generation ID
    BS->>VAI: Purge stale/removed page documents
```

---

## 🔌 Webhook Endpoint: `/api/events/gcs`

Exposes a ingress point mounted on the events router.

- **Event Type**: Listens for `google.cloud.storage.object.v1.finalized` events (sent automatically when a file is created or updated in GCS).
- **Payload**: Receives the GCS file metadata (bucket name, file path, and generation ID) to identify the changed asset.

---

## 🔐 Authentication & Webhook Security

To prevent spoofing or unauthorized ingestion, the `/api/events/gcs` webhook supports **Google OIDC ID Token verification** (which can be enabled or disabled in your configuration):

When enabled:

1.  The webhook intercepts requests and extracts the `Authorization: Bearer <ID_TOKEN>` header.
2.  Using Google's library (`google-auth-library`), it verifies:
    - **Signature & Validity**: The token is valid and cryptographically signed by Google.
    - **Issuer**: Must match `https://accounts.google.com`.
    - **Audience**: Matches the Backstage base path: `${baseUrl}/api/events/gcs`.
    - **Service Account Verification**: If configured, it ensures the token belongs exclusively to the expected GKE/Eventarc service account email (`events.modules.gcsEventarcWebhook.oidc.serviceAccountEmail`).

---

## 🌐 GKE Ingress Routing & Constraints

When an Eventarc trigger is configured with a GKE Service destination, Eventarc delivers events privately and internally directly to your Kubernetes Service within the GKE cluster:

1. Google's Eventarc agent automatically provisions a dedicated namespace `eventarc-<trigger-name>-<hash>` and deploys a managed **`gke-forwarder`** pod inside it.
2. The forwarder pod privately subscribes to Eventarc's Google-managed Pub/Sub topic, pulls events, and posts them **internally** inside the VPC network directly to your GKE service: `http://backstage.backstage.svc.cluster.local/api/events/gcs`.

> [!IMPORTANT] > **The Port 80 Constraint**: The GKE destination block for GCP Eventarc strictly routes events to port `80` and does not accept custom target port configurations. To support this, you **must** expose port `80` (Service port) in your Backstage Kubernetes Service configuration and map it to your container's port `7007` (Pod port) (see the Kubernetes configuration below).

> [!WARNING] > **Google OIDC Configuration in GKE**:
> Google OIDC ID Token verification is fully implemented in the module and can be enabled or disabled in configuration (`events.modules.gcsEventarcWebhook.oidc.enabled`). However, it **must** be disabled (`false`) when using GKE private routing.
>
> **The Reason**: Google Eventarc only generates and attaches Google OIDC ID tokens when delivering to public HTTPS endpoints, Cloud Run, or Cloud Functions. For GKE service destinations, Eventarc uses an internal cluster-local **gke-forwarder** pod that pulls from Pub/Sub and makes a direct HTTP POST request to your service. Because this forwarder pod runs locally within your VPC and cannot generate or attach Google OIDC ID tokens, the webhook will reject Eventarc requests if OIDC verification is enabled. Security for GKE internal endpoints should instead be handled at the network level (e.g., using Kubernetes `NetworkPolicies`).

> [!NOTE] > **Why the OIDC Verification Code is Retained**:
> Despite being disabled in GKE, the token verification logic is kept in the codebase to support:
>
> - **Local Development Tunnels**: For developers debugging webhook ingestion using public tunnels (such as `ngrok`), enabling OIDC ensures the endpoint remains cryptographically secured.
> - **Future-Proofing**: If the GKE Eventarc forwarder introduces support for token forwarding in the future, verification can be turned back on instantly via a config change (`enabled: true`) without requiring code modifications.

---

## 🔄 Delta Ingest & Reconciliation

1.  When `search_index.json` is updated, the webhook parses all active page locations.
2.  Documents are mapped to stable, deterministic **MD5-hashed IDs** generated from namespace, kind, name, and page path.
3.  The webhook reads the **immediately previous generation** of `search_index.json` from GCS versioning history.
4.  It compares the previous list of document IDs against the new generation to calculate which pages were deleted.
5.  Stale documents are deleted from Vertex AI Search to keep the index in sync with GCS.

---

## 🔌 Installation

First, install the package in your Backstage backend package:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-events-backend-module-gcs-eventarc
```

Then, add it to your `packages/backend/src/index.ts` alongside any other plugins/modules:

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins ...

backend.add(
  import('@backstage-community/plugin-events-backend-module-gcs-eventarc'),
);

backend.start();
```

---

## 📦 Kubernetes Service Mapping

To route private Eventarc traffic (port 80) and standard developer traffic (port 7007) to the Backstage container:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backstage
  namespace: backstage
spec:
  type: ClusterIP
  ports:
    - port: 7007
      targetPort: http
      protocol: TCP
      name: http
    - port: 80
      targetPort: http
      protocol: TCP
      name: eventarc # Map port 80 for internal GKE Eventarc Forwarder routing
  selector:
    app: backstage
```

---

## ⚙️ Configuration

Configure the webhook in your `app-config.yaml` as follows:

```yaml
events:
  modules:
    gcsEventarcWebhook:
      oidc:
        enabled: true # Set to false in GKE environments
        audience: ${baseUrl}/api/events/gcs
        serviceAccountEmail: ${gcpServiceAccount}
```

---

## 🛠️ Infrastructure Provisioning (Terraform)

### 🔑 Required Google Cloud APIs

Before provisioning, ensure the following service APIs are enabled on your GCP project:

- **`eventarc.googleapis.com`** (Eventarc API)
- **`eventarcpublishing.googleapis.com`** (Eventarc Publishing API, required for custom event delivery)
- **`container.googleapis.com`** (Kubernetes Engine API, required to discover and route GKE destinations)
- **`cloudresourcemanager.googleapis.com`** (Cloud Resource Manager API, required for IAM policy configuration)

To set up the Eventarc trigger in Google Cloud using Cloud Foundation Fabric (CFF) modules:

```hcl
resource "google_eventarc_trigger" "gcs_to_backstage_webhook" {
  name     = "gcs-to-backstage-webhook"
  location = "europe-west1" # Replace with your cluster region
  project  = var.project_id

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.storage.object.v1.finalized"
  }

  # Only trigger on techdocs bucket finalized uploads
  matching_criteria {
    attribute = "bucket"
    value     = var.techdocs_bucket_name
  }

  destination {
    gke {
      cluster   = var.gke_cluster_name
      location  = var.gke_cluster_location
      namespace = "backstage"
      service   = "backstage"
      path      = "/api/events/gcs"
    }
  }

  service_account = google_service_account.eventarc_trigger_sa.email
}
```

> [!IMPORTANT] > **Required GCP Service Accounts & IAM Roles**:
> To enable event routing to GKE, you must configure the following IAM permissions:
>
> 1. **Eventarc Trigger Service Account** (`google_service_account.eventarc_trigger_sa.email`):
>
>    - **`roles/eventarc.eventReceiver`** on the trigger resource.
>
> 2. **GCS Service Agent** (`service-<project-number>@gs-project-accounts.iam.gserviceaccount.com`):
>
>    - **`roles/pubsub.publisher`** on the GCP project (allows GCS to publish file creation events to Eventarc's Pub/Sub topics).
>
> 3. **Eventarc Service Agent** (`service-${data.google_project.project.number}@gcp-sa-eventarc.iam.gserviceaccount.com`):
>    - **`roles/compute.viewer`** on the GCP project (allows querying GKE cluster metadata).
>    - **`roles/container.developer`** on the GKE cluster (allows Eventarc to deploy and manage event-forwarder pods in your Backstage namespace).
>    - **`roles/iam.serviceAccountAdmin`** on the Eventarc Trigger Service Account (allows associating it with GKE forwarder pods).

### Customer-Managed Encryption Keys (CMEK) Support

If your organization enforces an organizational policy requiring Customer-Managed Encryption Keys (KMS) for Pub/Sub topics, you must configure Eventarc to use a KMS key when creating its underlying Pub/Sub topics.

Add the following to your Terraform configuration:

```hcl
# Configure the Google Eventarc channel in the region to use your KMS key
resource "google_eventarc_google_channel_config" "default" {
  provider        = google-beta
  location        = "europe-west1" # Must match trigger location
  project         = var.project_id
  name            = "googleChannelConfig"
  crypto_key_name = var.kms_key_id
}

# Grant the Eventarc Service Agent permission to use the KMS key
resource "google_kms_crypto_key_iam_member" "eventarc_kms" {
  crypto_key_id = var.kms_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-eventarc.iam.gserviceaccount.com"
}
```
