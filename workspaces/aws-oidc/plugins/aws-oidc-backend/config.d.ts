/**
 * Configuration schema for @backstage-community/plugin-aws-oidc-backend.
 *
 * Add to app-config.yaml:
 *
 * awsOidc:
 *   issuer: "${BACKSTAGE_URL}/api/aws-oidc"
 *   mode: kms
 *   kmsKeyId: "${AWS_OIDC_KMS_KEY_ID}"
 *   region: "${AWS_REGION}"
 */

export interface Config {
  awsOidc: {
    /**
     * Full public URL of the OIDC issuer.
     * Must be reachable by AWS IAM without authentication headers.
     * Typically: https://your-backstage.example.com/api/aws-oidc
     * @visibility frontend
     */
    issuer: string;

    /**
     * Signing mode.
     * - kms: Use AWS KMS asymmetric key (recommended for production).
     * - localKey: Use a local RSA PEM file (development with real STS).
     * - mock: In-memory key pair, fake STS credentials (local dev / CI).
     * - profile: Load credentials from a local AWS SSO profile (dev shortcut).
     * @visibility backend
     */
    mode?: 'kms' | 'localKey' | 'mock' | 'profile';

    /**
     * AWS KMS key ARN or alias used for JWT signing.
     * Required when mode=kms. Must be RSA-2048 with RSASSA_PKCS1_V1_5_SHA_256.
     * @visibility secret
     */
    kmsKeyId?: string;

    /**
     * AWS region for KMS and STS clients.
     * Required when mode=kms.
     * @visibility backend
     */
    region?: string;

    /**
     * Path to a PEM-encoded RSA-2048 private key file.
     * Required when mode=localKey.
     * @visibility secret
     */
    localPrivateKeyPath?: string;

    /**
     * AWS SSO profile mappings used in mode=profile.
     * Maps an AWS account ID to a local AWS CLI profile name.
     * @visibility backend
     */
    profiles?: Array<{
      /** 12-digit AWS account ID */
      accountId: string;
      /** AWS CLI profile name (from ~/.aws/config) */
      profile: string;
    }>;
  };
}
