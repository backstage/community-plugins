/**
 * router.test.ts
 *
 * Tests for the OIDC discovery Express router.
 * KmsService is mocked — router tests focus on HTTP behaviour only.
 */

import express from 'express';
import request from 'supertest';
import { createRouter } from '../router';
import type { LoggerService } from '@backstage/backend-plugin-api';

// region Fixtures

const logger: LoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const issuer = 'https://backstage.example.com/api/aws-oidc';

const fakeJwks = {
  keys: [
    {
      kty: 'RSA',
      use: 'sig',
      alg: 'RS256',
      kid: 'test-key',
      n: 'somereallylargebase64urlvalue',
      e: 'AQAB',
    },
  ],
};

const mockKmsService = {
  getJwks: jest.fn(),
  signJwt: jest.fn(),
};
// endregion

// region Setup

function buildApp() {
  const app = express();
  app.use(createRouter({ kmsService: mockKmsService as any, issuer, logger }));
  return app;
}
// endregion
// region Tests

describe('GET /.well-known/openid-configuration', () => {
  let app: express.Express;

  beforeEach(() => {
    app = buildApp();
  });

  it('returns 200 with JSON content-type', async () => {
    const res = await request(app).get('/.well-known/openid-configuration');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('returns the correct issuer', async () => {
    const res = await request(app).get('/.well-known/openid-configuration');
    expect(res.body.issuer).toBe(issuer);
  });

  it('points jwks_uri at the JWKS endpoint on the same issuer', async () => {
    const res = await request(app).get('/.well-known/openid-configuration');
    expect(res.body.jwks_uri).toBe(`${issuer}/.well-known/jwks.json`);
  });

  it('declares RS256 as the supported signing algorithm', async () => {
    const res = await request(app).get('/.well-known/openid-configuration');
    expect(res.body.id_token_signing_alg_values_supported).toContain('RS256');
  });

  it('includes required OIDC discovery fields', async () => {
    const res = await request(app).get('/.well-known/openid-configuration');
    expect(res.body).toMatchObject({
      issuer: expect.any(String),
      jwks_uri: expect.any(String),
      response_types_supported: expect.any(Array),
      subject_types_supported: expect.any(Array),
      id_token_signing_alg_values_supported: expect.any(Array),
    });
  });
});

describe('GET /.well-known/jwks.json', () => {
  let app: express.Express;

  beforeEach(() => {
    mockKmsService.getJwks.mockReset();
    app = buildApp();
  });

  it('returns 200 with the JWKS from KmsService', async () => {
    mockKmsService.getJwks.mockResolvedValue(fakeJwks);

    const res = await request(app).get('/.well-known/jwks.json');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeJwks);
  });

  it('sets Cache-Control header for public caching', async () => {
    mockKmsService.getJwks.mockResolvedValue(fakeJwks);

    const res = await request(app).get('/.well-known/jwks.json');
    expect(res.headers['cache-control']).toMatch(/public/);
    expect(res.headers['cache-control']).toMatch(/max-age/);
  });

  it('returns 500 when KmsService throws', async () => {
    mockKmsService.getJwks.mockRejectedValue(new Error('KMS unavailable'));

    const res = await request(app).get('/.well-known/jwks.json');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('returns JSON content-type on error responses too', async () => {
    mockKmsService.getJwks.mockRejectedValue(new Error('KMS unavailable'));

    const res = await request(app).get('/.well-known/jwks.json');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('calls KmsService.getJwks exactly once per request', async () => {
    mockKmsService.getJwks.mockResolvedValue(fakeJwks);

    await request(app).get('/.well-known/jwks.json');
    expect(mockKmsService.getJwks).toHaveBeenCalledTimes(1);
  });
});
