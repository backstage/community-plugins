/**
 * kmsService.test.ts
 *
 * Tests for KmsService — JWT signing and JWKS generation.
 * KMS and filesystem are fully mocked; no AWS credentials needed.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import { KmsService } from '../kmsService';
import type { LoggerService } from '@backstage/backend-plugin-api';


const mockSend = jest.fn();
jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  SignCommand: jest.fn().mockImplementation(input => ({ input })),
  GetPublicKeyCommand: jest.fn().mockImplementation(input => ({ input })),
}));

// Mock fs so readFileSync can be controlled in localKey tests
jest.mock('fs');

// region Helpers and fixtures
const logger: LoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

/** Decode a base64url string to a Buffer */
function fromBase64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/** Split a compact JWT into its three parts */
function decodeJwt(token: string): {
  header: any;
  payload: any;
  signature: Buffer;
} {
  const [h, p, s] = token.split('.');
  return {
    header: JSON.parse(fromBase64url(h).toString()),
    payload: JSON.parse(fromBase64url(p).toString()),
    signature: fromBase64url(s),
  };
}

/** Generate a deterministic RSA-2048 key pair for testing */
function makeKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}


const baseClaims = {
  iss: 'https://backstage.example.com/api/aws-oidc',
  aud: 'sts.amazonaws.com',
  sub: 'scaffolder:test-template',
  iat: 1700000000,
  exp: 1700003600,
};
// endregion
// region Tests
describe('KmsService — mode: mock', () => {
  let service: KmsService;

  beforeEach(() => {
    service = new KmsService({ mode: 'mock', logger });
  });

  it('signs a JWT with RS256 algorithm header', async () => {
    const token = await service.signJwt(baseClaims);
    const { header } = decodeJwt(token);
    expect(header.alg).toBe('RS256');
    expect(header.typ).toBe('JWT');
    expect(header.kid).toBe('mock-key');
  });

  it('embeds all claims in the payload', async () => {
    const token = await service.signJwt(baseClaims);
    const { payload } = decodeJwt(token);
    expect(payload.iss).toBe(baseClaims.iss);
    expect(payload.aud).toBe(baseClaims.aud);
    expect(payload.sub).toBe(baseClaims.sub);
    expect(payload.iat).toBe(baseClaims.iat);
    expect(payload.exp).toBe(baseClaims.exp);
  });

  it('produces a verifiable signature using the in-memory public key', async () => {
    const token = await service.signJwt(baseClaims);
    const [h, p, s] = token.split('.');
    const jwks = await service.getJwks();

    const jwk = jwks.keys[0];
    const pubKey = crypto.createPublicKey({ key: jwk as any, format: 'jwk' });
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(`${h}.${p}`);
    expect(verify.verify(pubKey, fromBase64url(s))).toBe(true);
  });

  it('returns a JWKS with one RSA key', async () => {
    const jwks = await service.getJwks();
    expect(jwks.keys).toHaveLength(1);
    const key = jwks.keys[0];
    expect(key.kty).toBe('RSA');
    expect(key.alg).toBe('RS256');
    expect(key.use).toBe('sig');
    expect(key.kid).toBe('mock-key');
    expect(key.n).toBeTruthy();
    expect(key.e).toBeTruthy();
  });

  it('reuses the same in-memory key across multiple calls', async () => {
    const jwks1 = await service.getJwks();
    const jwks2 = await service.getJwks();
    expect(jwks1.keys[0].n).toBe(jwks2.keys[0].n);
  });
});


// localkEy
describe('KmsService — mode: localKey', () => {
  let service: KmsService;
  let privateKeyPem: string;
  let publicKeyPem: string;

  beforeEach(() => {
    const pair = makeKeyPair();
    privateKeyPem = pair.privateKey;
    publicKeyPem = pair.publicKey;

    (fs.readFileSync as jest.Mock).mockReturnValue(privateKeyPem);

    service = new KmsService({
      mode: 'localKey',
      localPrivateKeyPath: '/fake/path/dev-key.pem',
      logger,
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('reads the PEM file from the configured path', () => {
    expect(fs.readFileSync).toHaveBeenCalledWith(
      '/fake/path/dev-key.pem',
      'utf8',
    );
  });

  it('signs a JWT with kid=local-dev-key', async () => {
    const token = await service.signJwt(baseClaims);
    const { header } = decodeJwt(token);
    expect(header.kid).toBe('local-dev-key');
    expect(header.alg).toBe('RS256');
  });

  it('produces a signature verifiable with the corresponding public key', async () => {
    const token = await service.signJwt(baseClaims);
    const [h, p, s] = token.split('.');

    const pubKey = crypto.createPublicKey(publicKeyPem);
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(`${h}.${p}`);
    expect(verify.verify(pubKey, fromBase64url(s))).toBe(true);
  });

  it('returns JWKS with kid=local-dev-key', async () => {
    const jwks = await service.getJwks();
    expect(jwks.keys[0].kid).toBe('local-dev-key');
  });

  it('throws if localPrivateKeyPath is not provided', () => {
    expect(() => new KmsService({ mode: 'localKey', logger })).toThrow(
      'awsOidc.localPrivateKeyPath is required when mode=localKey',
    );
  });
});

// region kms
describe('KmsService — mode: kms', () => {
  let service: KmsService;
  let testKeyPair: { privateKey: string; publicKey: string };

  beforeEach(() => {
    testKeyPair = makeKeyPair();
    mockSend.mockReset();
    service = new KmsService({
      mode: 'kms',
      kmsKeyId: 'arn:aws:kms:eu-west-1:123456789012:key/abcd-1234',
      region: 'eu-west-1',
      logger,
    });
  });

  it('throws if kmsKeyId is not provided', () => {
    expect(
      () => new KmsService({ mode: 'kms', region: 'eu-west-1', logger }),
    ).toThrow('awsOidc.kmsKeyId is required when mode=kms');
  });

  it('throws if region is not provided', () => {
    expect(
      () => new KmsService({ mode: 'kms', kmsKeyId: 'alias/my-key', logger }),
    ).toThrow('awsOidc.region is required when mode=kms');
  });

  it('calls KMS Sign with the correct algorithm and message', async () => {
    const privKey = crypto.createPrivateKey(testKeyPair.privateKey);
    mockSend.mockImplementation(async (cmd: any) => {
      if (cmd.input?.Message) {
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(Buffer.from(cmd.input.Message));
        return { Signature: sign.sign(privKey) };
      }
      const pub = crypto.createPublicKey(testKeyPair.publicKey);
      return { PublicKey: pub.export({ type: 'spki', format: 'der' }) };
    });

    const token = await service.signJwt(baseClaims);
    const { header } = decodeJwt(token);
    expect(header.alg).toBe('RS256');

    const signCall = mockSend.mock.calls[0][0];
    expect(signCall.input.SigningAlgorithm).toBe('RSASSA_PKCS1_V1_5_SHA_256');
    expect(signCall.input.MessageType).toBe('RAW');
    expect(signCall.input.KeyId).toBe(
      'arn:aws:kms:eu-west-1:123456789012:key/abcd-1234',
    );
  });

  it('calls KMS GetPublicKey and converts DER to JWK for JWKS', async () => {
    const pub = crypto.createPublicKey(testKeyPair.publicKey);
    const derKey = pub.export({ type: 'spki', format: 'der' });
    mockSend.mockResolvedValue({ PublicKey: derKey });

    const jwks = await service.getJwks();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(jwks.keys).toHaveLength(1);
    expect(jwks.keys[0].kty).toBe('RSA');
    expect(jwks.keys[0].alg).toBe('RS256');
  });

  it('uses the last 8 chars of the key ARN as kid', async () => {
    const pub = crypto.createPublicKey(testKeyPair.publicKey);
    mockSend.mockResolvedValue({
      PublicKey: pub.export({ type: 'spki', format: 'der' }),
    });

    const jwks = await service.getJwks();
    // 'arn:aws:kms:eu-west-1:123456789012:key/abcd-1234' → last segment 'abcd-1234' → last 8 chars 'bcd-1234'
    expect(jwks.keys[0].kid).toBe('bcd-1234');
  });

  it('throws if KMS Sign returns no signature', async () => {
    mockSend.mockResolvedValue({ Signature: undefined });
    await expect(service.signJwt(baseClaims)).rejects.toThrow(
      'KMS Sign returned no signature',
    );
  });

  it('throws if KMS GetPublicKey returns no key', async () => {
    mockSend.mockResolvedValue({ PublicKey: undefined });
    await expect(service.getJwks()).rejects.toThrow(
      'KMS GetPublicKey returned no key',
    );
  });
});
// endregion
//endregion