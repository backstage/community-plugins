# @backstage-community/plugin-aws-oidc-backend

## 0.1.0

### Minor Changes

- Initial release of `@backstage-community/plugin-aws-oidc-backend`.

  Provides an AWS OIDC Identity Provider for Backstage, enabling scaffolder templates to obtain short-lived AWS credentials via `AssumeRoleWithWebIdentity` without storing long-lived credentials.

  **Features:**
  - OIDC discovery (`/.well-known/openid-configuration`) and JWKS (`/.well-known/jwks.json`) endpoints
  - KMS signing (production), local RSA key (development), mock mode (CI/testing)
  - `aws:assumeRole` scaffolder action with catalog entity annotation support
  - `aws.backstage.io/assume-role-arn` annotation for per-entity role ARN resolution
