# @backstage-community/plugin-aws-oidc-backend

A Backstage backend plugin that acts as an **AWS OIDC Identity Provider**. It issues short-lived AWS credentials via OIDC token exchange (`AssumeRoleWithWebIdentity`), enabling Backstage scaffolder templates to deploy to AWS without storing long-lived credentials.

## How it works

```
Scaffolder template
      │
      ▼
aws:assumeRole action
      │  signs JWT (RS256) using KMS / local key / mock key
      ▼
STS AssumeRoleWithWebIdentity
      │  AWS verifies JWT signature against JWKS endpoint
      ▼
Short-lived AWS credentials (accessKeyId / secretAccessKey / sessionToken)
      │
      ▼
Subsequent template steps (CDK deploy, S3 upload, etc.)
```

AWS IAM verifies JWT signatures by fetching the JWKS document from your Backstage instance, so **the OIDC discovery and JWKS endpoints must be publicly reachable by AWS**.

## Features

- **KMS signing** (production) — private key never leaves AWS KMS
- **Local RSA key** (development with real STS) — sign with a local PEM file, expose via tunnel
- **Mock mode** (local development / CI) — no AWS credentials needed, returns fake creds
- **Profile mode** (development shortcut) — load credentials directly from a local AWS SSO profile
- **Scaffolder action** `aws:assumeRole` — resolve role ARN from explicit input or from a catalog entity annotation
- **Catalog integration** — read the role ARN from `aws.backstage.io/assume-role-arn` annotation on any entity

## Installation

### 1. Install the package

```bash
# In your Backstage root
yarn --cwd packages/backend add @backstage-community/plugin-aws-oidc-backend
```

### 2. Register the plugins

In `packages/backend/src/index.ts`:

```ts
// OIDC discovery + JWKS endpoints
backend.add(import('@backstage-community/plugin-aws-oidc-backend'));

// aws:assumeRole scaffolder action
backend.add(import('@backstage-community/plugin-aws-oidc-backend/scaffolder'));
```

### 3. Configure

Add to `app-config.yaml`:

```yaml
awsOidc:
  # Must be publicly reachable by AWS IAM (no auth headers)
  issuer: '${BACKSTAGE_URL}/api/aws-oidc'
  mode: kms # kms | localKey | mock | profile
  kmsKeyId: '${AWS_OIDC_KMS_KEY_ID}' # required when mode=kms
  region: '${AWS_REGION}' # required when mode=kms
```

### 4. Register the OIDC Identity Provider in AWS IAM

```bash
aws iam create-open-id-connect-provider \
  --url "https://your-backstage.example.com/api/aws-oidc" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "<sha1-thumbprint-of-your-tls-cert>"
```

You only need to do this once per Backstage instance.

### 5. Add a trust policy to your IAM roles

Any IAM role you want Backstage to assume needs a trust policy like this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/your-backstage.example.com/api/aws-oidc"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "your-backstage.example.com/api/aws-oidc:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "your-backstage.example.com/api/aws-oidc:sub": "component:default/*"
        }
      }
    }
  ]
}
```

Tighten the `sub` condition to restrict which entities/templates can assume the role.

## Configuration reference

| Key | Required | Default | Description |
|---|---|---|---|
| `awsOidc.issuer` | Yes | — | Full public URL of the OIDC issuer. Must match `{backstageUrl}/api/aws-oidc`. |
| `awsOidc.mode` | No | `kms` | Signing mode: `kms`, `localKey`, `mock`, or `profile`. |
| `awsOidc.kmsKeyId` | When `mode=kms` | — | KMS key ARN or alias. Must be RSA-2048 with RSASSA_PKCS1_V1_5_SHA_256. |
| `awsOidc.region` | When `mode=kms` | — | AWS region for KMS and STS clients. |
| `awsOidc.localPrivateKeyPath` | When `mode=localKey` | — | Path to a PEM-encoded RSA-2048 private key file. |
| `awsOidc.profiles` | When `mode=profile` | — | List of `{ accountId, profile }` mappings for SSO profile lookup. |

## Signing modes

### `kms` — Production

Uses an AWS KMS asymmetric key (RSA-2048, `RSASSA_PKCS1_V1_5_SHA_256`). The private key never leaves KMS. Requires `kmsKeyId` and `region`.

IAM permissions required by the Backstage backend role:

```json
{
  "Effect": "Allow",
  "Action": ["kms:Sign", "kms:GetPublicKey"],
  "Resource": "arn:aws:kms:<region>:<account>:key/<key-id>"
}
```

### `localKey` — Development with real STS

Signs JWTs with a local RSA-2048 PEM file. Use a tunnel (e.g. [localhost.run](https://localhost.run)) to expose your local JWKS endpoint to AWS.

```bash
# Generate a dev key
openssl genrsa -out dev-key.pem 2048

# Expose your local Backstage to the internet
ssh -R 80:localhost:7007 localhost.run
# Use the tunnel URL as awsOidc.issuer
```

### `mock` — Local development / CI

Generates an in-memory RSA key pair at startup. Returns fake STS credentials without any AWS calls. Useful for running scaffolder templates locally without any AWS setup.

### `profile` — Development shortcut

Loads credentials directly from a local AWS SSO profile, bypassing OIDC entirely. Requires `aws sso login` to have been run first.

```yaml
# app-config.local.yaml
awsOidc:
  mode: profile
  profiles:
    - accountId: '123456789012'
      profile: my-sso-profile
```

## Scaffolder action: `aws:assumeRole`

### Input

| Field | Type | Required | Description |
|---|---|---|---|
| `roleArn` | `string` | One of `roleArn` / `entityRef` | Explicit IAM role ARN to assume. |
| `entityRef` | `string` | One of `roleArn` / `entityRef` | Catalog entity ref; reads ARN from `aws.backstage.io/assume-role-arn` annotation. |
| `subject` | `string` | No | JWT `sub` claim. Defaults to the entity ref or `"scaffolder:unknown"`. |
| `sessionName` | `string` | No | STS session name (visible in CloudTrail). Defaults to `"backstage-session"`. |
| `durationSeconds` | `number` | No | Credential lifetime (900–43200). Defaults to `900`. |

### Output

| Field | Description |
|---|---|
| `accessKeyId` | AWS access key ID |
| `secretAccessKey` | AWS secret access key |
| `sessionToken` | AWS session token |
| `expiration` | ISO 8601 expiration timestamp |

### Example template step

```yaml
steps:
  - id: assume-role
    name: Get AWS credentials
    action: aws:assumeRole
    input:
      entityRef: component:default/${{ parameters.componentName }}
      sessionName: backstage-${{ parameters.componentName }}
      durationSeconds: 900

  - id: deploy
    name: Deploy to AWS
    action: aws:cloudformation:deploy # example — any action that accepts credentials
    input:
      accessKeyId: ${{ steps['assume-role'].output.accessKeyId }}
      secretAccessKey: ${{ steps['assume-role'].output.secretAccessKey }}
      sessionToken: ${{ steps['assume-role'].output.sessionToken }}
```

### Entity annotation

Add the role ARN to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    aws.backstage.io/assume-role-arn: 'arn:aws:iam::123456789012:role/backstage-deploy-my-service'
spec:
  type: service
  lifecycle: production
  owner: team-a
```

## Local development

```bash
# Start the plugin standalone with mock mode (no AWS needed)
cd plugins/aws-oidc-backend
yarn start

# Verify OIDC discovery
curl http://localhost:7007/api/aws-oidc/.well-known/openid-configuration

# Verify JWKS
curl http://localhost:7007/api/aws-oidc/.well-known/jwks.json
```

## License

Apache-2.0 — see [LICENSE](../../LICENSE).
