/**
 * kmsService.ts — JWT signing and JWKS for aws-oidc-backend
 *
 * Three modes (controlled by awsOidc.mode in config):
 *
 *   kms      (production)
 *            Signs JWTs using AWS KMS asymmetric key (RSA-2048, RS256).
 *            Private key never leaves KMS.
 *            Requires: awsOidc.kmsKeyId, awsOidc.region
 *            IAM permissions needed: kms:Sign, kms:GetPublicKey
 *
 *   localKey (development with real STS calls)
 *            Signs JWTs using a local PEM private key file.
 *            Use with localhost.run tunnel to expose JWKS to AWS.
 *            Requires: awsOidc.localPrivateKeyPath
 *
 *   mock     (local development / CI)
 *            Auto-generates an in-memory RSA key pair on startup.
 *            Returns fake STS credentials — no AWS calls made.
 *            No config required beyond mode: mock.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
} from '@aws-sdk/client-kms';
import { LoggerService } from '@backstage/backend-plugin-api';

// region Types and interfaces
export type OidcMode = 'kms' | 'localKey' | 'mock' | 'profile'; // profile mode added for testing with real AWS credentials from environment

export interface JwtClaims {
  /** Who issued the token — must match awsOidc.issuer */
  iss: string;
  /** Audience — must be "sts.amazonaws.com" for AssumeRoleWithWebIdentity */
  aud: string;
  /** Subject — used to scope IAM trust policy (e.g. "scaffolder:my-template") */
  sub: string;
  /** Expiry — unix timestamp seconds */
  exp: number;
  /** Issued at — unix timestamp seconds */
  iat: number;
  /** Any additional claims */
  [key: string]: unknown;
}

export interface Jwk {
  kty: string;
  use: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
}

export interface JwksDocument {
  keys: Jwk[];
}

export interface KmsServiceOptions {
  mode: OidcMode;
  /** KMS key ARN or alias — required for mode=kms */
  kmsKeyId?: string;
  /** AWS region for KMS — required for mode=kms */
  region?: string;
  /** Path to PEM private key file — required for mode=localKey */
  localPrivateKeyPath?: string;
  logger: LoggerService;
}
// endregion
// region Utility functions

function base64url(data: Buffer | string): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function buildSigningInput(header: object, payload: object): string {
  return `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`;
}

function publicKeyToJwk(publicKey: crypto.KeyObject, kid: string): Jwk {
  const jwk = publicKey.export({ format: 'jwk' }) as {
    kty: string;
    n: string;
    e: string;
  };
  return {
    kty: jwk.kty,
    use: 'sig',
    alg: 'RS256',
    kid,
    n: jwk.n,
    e: jwk.e,
  };
}
// endregion

// region KmsService

export class KmsService {
  private readonly mode: OidcMode;
  private readonly logger: LoggerService;
  private readonly kmsKeyId?: string;
  private readonly kmsClient?: KMSClient;
  private readonly localPrivateKey?: crypto.KeyObject;
  private readonly localPublicKey?: crypto.KeyObject;
  // Mock mode: in-memory key pair generated once on construction
  private readonly mockPrivateKey?: crypto.KeyObject;
  private readonly mockPublicKey?: crypto.KeyObject;

  constructor(options: KmsServiceOptions) {
    this.mode = options.mode;
    this.logger = options.logger;

    if (options.mode === 'kms') {
      if (!options.kmsKeyId)
        throw new Error('awsOidc.kmsKeyId is required when mode=kms');
      if (!options.region)
        throw new Error('awsOidc.region is required when mode=kms');
      this.kmsKeyId = options.kmsKeyId;
      this.kmsClient = new KMSClient({ region: options.region });
      this.logger.info(
        `[aws-oidc] KmsService initialised — mode=kms keyId=${options.kmsKeyId}`,
      );
    } else if (options.mode === 'localKey') {
      if (!options.localPrivateKeyPath) {
        throw new Error(
          'awsOidc.localPrivateKeyPath is required when mode=localKey',
        );
      }
      const pem = fs.readFileSync(options.localPrivateKeyPath, 'utf8');
      this.localPrivateKey = crypto.createPrivateKey(pem);
      this.localPublicKey = crypto.createPublicKey(this.localPrivateKey);
      this.logger.info(
        `[aws-oidc] KmsService initialised — mode=localKey path=${options.localPrivateKeyPath}`,
      );
    } else if (options.mode === 'profile') {
      this.logger.info(
        '[aws-oidc] KmsService initialised — mode=PROFILE. Using AWS credentials from profile.',
      );
    } else {
      // mock — generate in-memory RSA-2048 key pair
      this.logger.warn(
        '[aws-oidc] KmsService initialised — mode=MOCK. JWTs are signed with an in-memory key. ' +
          'AWS STS calls will be skipped and fake credentials returned. DO NOT use in production.',
      );
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      this.mockPrivateKey = crypto.createPrivateKey(privateKey);
      this.mockPublicKey = crypto.createPublicKey(publicKey);
    }
  }

  /**
   * Sign a JWT with the configured key.
   * Returns a compact serialisation: header.payload.signature
   */
  async signJwt(claims: JwtClaims): Promise<string> {
    const kid = await this.getKeyId();
    const header = { alg: 'RS256', typ: 'JWT', kid };
    const signingInput = buildSigningInput(header, claims);
    const messageBuffer = Buffer.from(signingInput, 'utf8');

    let signatureBuffer: Buffer;

    if (this.mode === 'kms') {
      const result = await this.kmsClient!.send(
        new SignCommand({
          KeyId: this.kmsKeyId!,
          Message: messageBuffer,
          MessageType: 'RAW',
          SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
        }),
      );
      if (!result.Signature) throw new Error('KMS Sign returned no signature');
      signatureBuffer = Buffer.from(result.Signature);
    } else {
      const privateKey =
        this.mode === 'localKey' ? this.localPrivateKey! : this.mockPrivateKey!;
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(messageBuffer);
      signatureBuffer = sign.sign(privateKey);
    }

    return `${signingInput}.${base64url(signatureBuffer)}`;
  }

  /**
   * Returns the JWKS document (public key set) for the /.well-known/jwks.json endpoint.
   */
  async getJwks(): Promise<JwksDocument> {
    const kid = await this.getKeyId();

    if (this.mode === 'kms') {
      const result = await this.kmsClient!.send(
        new GetPublicKeyCommand({ KeyId: this.kmsKeyId! }),
      );
      if (!result.PublicKey)
        throw new Error('KMS GetPublicKey returned no key');
      // KMS returns DER-encoded SubjectPublicKeyInfo
      const pubKey = crypto.createPublicKey({
        key: Buffer.from(result.PublicKey),
        format: 'der',
        type: 'spki',
      });
      return { keys: [publicKeyToJwk(pubKey, kid)] };
    }

    const publicKey =
      this.mode === 'localKey' ? this.localPublicKey! : this.mockPublicKey!;
    return { keys: [publicKeyToJwk(publicKey, kid)] };
  }

  /**
   * Returns a stable key ID string for the kid header claim.
   * KMS: last 8 chars of the key ARN/alias.
   * localKey / mock: static strings.
   */
  private async getKeyId(): Promise<string> {
    if (this.mode === 'kms') {
      const id = this.kmsKeyId!;
      // Use last segment of ARN (key UUID) or the alias name
      return id.split('/').pop()?.slice(-8) ?? id.slice(-8);
    }
    if (this.mode === 'localKey') return 'local-dev-key';
    return 'mock-key';
  }
}
// endregion