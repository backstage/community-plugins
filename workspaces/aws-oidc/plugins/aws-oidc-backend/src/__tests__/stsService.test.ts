/**
 * stsService.test.ts
 *
 * Tests for StsService — AssumeRoleWithWebIdentity and mock credential return.
 * AWS STS is fully mocked; no real AWS calls are made.
 */

import { StsService } from '../stsService';
import type { LoggerService } from '@backstage/backend-plugin-api';


const mockSend = jest.fn();
jest.mock('@aws-sdk/client-sts', () => ({
  STSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  AssumeRoleWithWebIdentityCommand: jest
    .fn()
    .mockImplementation(input => ({ input })),
}));

// region Helpers and fixtures

const logger: LoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const baseOptions = {
  roleArn: 'arn:aws:iam::123456789012:role/backstage-deploy-my-service',
  webIdentityToken: 'eyJhbGciOiJSUzI1NiJ9.fake.token',
  sessionName: 'backstage-session',
  durationSeconds: 900,
};

const fakeStsCredentials = {
  AccessKeyId: 'TEST_ACCESS_KEY_ID',
  SecretAccessKey: 'TEST_SECRET_ACCESS_KEY',
  SessionToken: 'TEST_SESSION_TOKEN',
  Expiration: new Date('2024-01-01T01:00:00Z'),
};

// region mode: mock

describe('StsService — mode: mock', () => {
  let service: StsService;

  beforeEach(() => {
    mockSend.mockReset();
    service = new StsService({ mode: 'mock', logger });
  });

  it('returns fake credentials without calling STS', async () => {
    const creds = await service.assumeRole(baseOptions);

    expect(mockSend).not.toHaveBeenCalled();
    expect(creds.accessKeyId).toBe('MOCK_ACCESS_KEY_ID');
    expect(creds.secretAccessKey).toBeTruthy();
    expect(creds.sessionToken).toBeTruthy();
  });

  it('returns an expiration in the future', async () => {
    const before = Date.now();
    const creds = await service.assumeRole(baseOptions);
    const expiry = new Date(creds.expiration).getTime();

    expect(expiry).toBeGreaterThan(before);
  });

  it('respects durationSeconds when computing mock expiry', async () => {
    const duration = 3600;
    const before = Date.now();
    const creds = await service.assumeRole({
      ...baseOptions,
      durationSeconds: duration,
    });
    const expiry = new Date(creds.expiration).getTime();

    // Should expire roughly `duration` seconds from now (±5s tolerance)
    expect(expiry).toBeGreaterThan(before + (duration - 5) * 1000);
    expect(expiry).toBeLessThan(before + (duration + 5) * 1000);
  });
});

// region mode: kms / localKey (real STS path)

describe('StsService — mode: kms (real STS path)', () => {
  let service: StsService;

  beforeEach(() => {
    mockSend.mockReset();
    service = new StsService({ mode: 'kms', region: 'eu-west-1', logger });
  });

  it('calls AssumeRoleWithWebIdentity with the correct parameters', async () => {
    mockSend.mockResolvedValue({ Credentials: fakeStsCredentials });

    await service.assumeRole(baseOptions);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd.input.RoleArn).toBe(baseOptions.roleArn);
    expect(cmd.input.RoleSessionName).toBe(baseOptions.sessionName);
    expect(cmd.input.WebIdentityToken).toBe(baseOptions.webIdentityToken);
    expect(cmd.input.DurationSeconds).toBe(baseOptions.durationSeconds);
  });

  it('maps STS credentials to the expected output shape', async () => {
    mockSend.mockResolvedValue({ Credentials: fakeStsCredentials });

    const creds = await service.assumeRole(baseOptions);

    expect(creds.accessKeyId).toBe(fakeStsCredentials.AccessKeyId);
    expect(creds.secretAccessKey).toBe(fakeStsCredentials.SecretAccessKey);
    expect(creds.sessionToken).toBe(fakeStsCredentials.SessionToken);
    expect(creds.expiration).toBe(fakeStsCredentials.Expiration.toISOString());
  });

  it('throws when STS returns incomplete credentials', async () => {
    mockSend.mockResolvedValue({
      Credentials: {
        AccessKeyId: 'ASIA123',
        SecretAccessKey: undefined,
        SessionToken: undefined,
      },
    });

    await expect(service.assumeRole(baseOptions)).rejects.toThrow(
      'STS AssumeRoleWithWebIdentity returned incomplete credentials',
    );
  });

  it('throws when STS returns no Credentials object', async () => {
    mockSend.mockResolvedValue({});

    await expect(service.assumeRole(baseOptions)).rejects.toThrow(
      'STS AssumeRoleWithWebIdentity returned incomplete credentials',
    );
  });

  it('propagates STS errors (e.g. InvalidIdentityToken)', async () => {
    mockSend.mockRejectedValue(
      new Error('InvalidIdentityToken: Token is expired'),
    );

    await expect(service.assumeRole(baseOptions)).rejects.toThrow(
      'InvalidIdentityToken: Token is expired',
    );
  });

  it('falls back to computed expiration when STS omits Expiration', async () => {
    const { Expiration: _omit, ...credsWithoutExpiry } = fakeStsCredentials;
    mockSend.mockResolvedValue({ Credentials: credsWithoutExpiry });

    const before = Date.now();
    const creds = await service.assumeRole(baseOptions);
    const expiry = new Date(creds.expiration).getTime();

    expect(expiry).toBeGreaterThan(before);
  });
});
