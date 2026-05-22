/**
 * stsService.ts — AWS STS AssumeRoleWithWebIdentity
 *
 * Wraps the STS call for the aws:assumeRole scaffolder action.
 * In mock mode, skips the STS call entirely and returns fake credentials
 * so the rest of the scaffolder template can be tested without real AWS.
 *
 * In profile mode, skips OIDC entirely and loads credentials directly from
 * a local AWS SSO profile. The profile is selected by matching the AWS account
 * ID extracted from the roleArn against the configured profileMap.
 */

import {
  STSClient,
  AssumeRoleWithWebIdentityCommand,
} from '@aws-sdk/client-sts';
import { fromIni } from '@aws-sdk/credential-providers';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OidcMode } from './kmsService';

// region Types and interfaces
export interface AssumeRoleOptions {
  roleArn: string;
  webIdentityToken: string;
  sessionName: string;
  durationSeconds: number;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

export interface StsServiceOptions {
  mode: OidcMode;
  /** AWS region for STS endpoint — defaults to us-east-1 (global STS) */
  region?: string;
  /**
   * Account ID → AWS SSO profile name mapping.
   * Used in profile mode to select the correct local SSO profile based on
   * the target role's account ID (extracted from the roleArn).
   *
   * Example (app-config.local.yaml):
   *   awsOidc:
   *     mode: profile
   *     profiles:
   *       - accountId: '1234567890'
   *         profile: account_name
   */
  profileMap?: Record<string, string>;
  logger: LoggerService;
}
// endregion

// region StsService

export class StsService {
  private readonly mode: OidcMode;
  private readonly logger: LoggerService;
  private readonly stsClient: STSClient;
  private readonly profileMap: Record<string, string>;

  constructor(options: StsServiceOptions) {
    this.mode = options.mode;
    this.logger = options.logger;
    this.profileMap = options.profileMap ?? {};
    // STS is a global service — us-east-1 works everywhere.
    // Using the configured region keeps latency low in eu-west-1 setups.
    this.stsClient = new STSClient({ region: options.region ?? 'us-east-1' });
  }

  /**
   * Assumes the given IAM role using a web identity token (JWT).
   *
   * In mock mode, skips the STS API call and returns clearly-labelled fake
   * credentials. The fake credentials will fail if actually used against AWS —
   * they exist only so the scaffolder template can complete its run locally.
   *
   * In profile mode, skips OIDC/STS entirely and returns credentials loaded
   * from the local AWS SSO profile mapped to the role's account ID.
   */
  async assumeRole(options: AssumeRoleOptions): Promise<AwsCredentials> {
    const { roleArn, webIdentityToken, sessionName, durationSeconds } = options;

    if (this.mode === 'mock') {
      this.logger.warn(
        `[aws-oidc][MOCK] Skipping STS AssumeRoleWithWebIdentity for role=${roleArn}. ` +
          'Returning fake credentials. Set awsOidc.mode=kms or localKey for real credentials.',
      );
      return {
        accessKeyId: 'MOCK_ACCESS_KEY_ID',
        secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
        sessionToken: 'MOCK_SESSION_TOKEN',
        expiration: new Date(Date.now() + durationSeconds * 1000).toISOString(),
      };
    }

    if (this.mode === 'profile') {
      // Extract account ID from roleArn: arn:aws:iam::<accountId>:role/<name>
      const accountId = roleArn.split(':')[4];
      if (!accountId) {
        throw new Error(
          `[aws-oidc][PROFILE] Could not parse account ID from roleArn="${roleArn}".`,
        );
      }

      const profile = this.profileMap[accountId];
      if (!profile) {
        throw new Error(
          `[aws-oidc][PROFILE] No AWS SSO profile configured for account ID "${accountId}". ` +
            `Add an entry to awsOidc.profileMap in app-config.local.yaml.`,
        );
      }

      this.logger.info(
        `[aws-oidc][PROFILE] Using SSO profile "${profile}" for account ${accountId} (role=${roleArn})`,
      );

      const creds = await fromIni({ profile })();
      if (!creds.accessKeyId || !creds.secretAccessKey) {
        throw new Error(
          `[aws-oidc][PROFILE] Failed to load credentials from AWS SSO profile "${profile}". ` +
            `Run: aws sso login --profile ${profile}`,
        );
      }

      return {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken ?? '',
        expiration: new Date(Date.now() + durationSeconds * 1000).toISOString(),
      };
    }

    this.logger.info(
      `[aws-oidc] AssumeRoleWithWebIdentity — role=${roleArn} session=${sessionName} duration=${durationSeconds}s`,
    );

    const result = await this.stsClient.send(
      new AssumeRoleWithWebIdentityCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        WebIdentityToken: webIdentityToken,
        DurationSeconds: durationSeconds,
      }),
    );

    const creds = result.Credentials;
    if (!creds?.AccessKeyId || !creds.SecretAccessKey || !creds.SessionToken) {
      throw new Error(
        `STS AssumeRoleWithWebIdentity returned incomplete credentials for role=${roleArn}`,
      );
    }

    return {
      accessKeyId: creds.AccessKeyId,
      secretAccessKey: creds.SecretAccessKey,
      sessionToken: creds.SessionToken,
      expiration:
        creds.Expiration?.toISOString() ??
        new Date(Date.now() + durationSeconds * 1000).toISOString(),
    };
  }
}
// endregion
