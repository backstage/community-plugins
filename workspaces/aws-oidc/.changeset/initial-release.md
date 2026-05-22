---
'@backstage-community/plugin-aws-oidc-backend': minor
---

Initial release of `@backstage-community/plugin-aws-oidc-backend`.

Provides an AWS OIDC Identity Provider for Backstage, enabling scaffolder templates to obtain short-lived AWS credentials via `AssumeRoleWithWebIdentity` without storing long-lived credentials.

**Features:**
- OIDC discovery (`/.well-known/openid-configuration`) and JWKS (`/.well-known/jwks.json`) endpoints, publicly accessible for AWS IAM verification
- KMS signing (production) — private key never leaves AWS KMS
- Local RSA key (development) — sign with a PEM file, expose via tunnel
- Mock mode (CI/local dev) — no AWS credentials needed
- `aws:assumeRole` scaffolder action
- Role ARN resolution from explicit input or from `aws.backstage.io/assume-role-arn` catalog entity annotation
