/**
 * dev/index.ts — standalone development runner for aws-oidc-backend
 *
 * Starts a minimal Backstage backend with the aws-oidc plugin loaded in mock
 * mode. No AWS credentials or KMS key are required.
 *
 * Usage:
 *   yarn start
 *
 * Endpoints available at http://localhost:7007:
 *   GET /api/aws-oidc/.well-known/openid-configuration
 *   GET /api/aws-oidc/.well-known/jwks.json
 *
 * To test the aws:assumeRole scaffolder action, also register the scaffolder
 * module (see README for full setup instructions).
 */

import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import awsOidcPlugin from '../src';

const backend = createBackend();

// Override config with mock-mode defaults so no AWS setup is needed
backend.add(
  mockServices.rootConfig.factory({
    data: {
      app: {
        baseUrl: 'http://localhost:3000',
      },
      backend: {
        baseUrl: 'http://localhost:7007',
        listen: { port: 7007 },
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
      awsOidc: {
        issuer: 'http://localhost:7007/api/aws-oidc',
        mode: 'mock',
      },
    },
  }),
);

backend.add(awsOidcPlugin);

backend.start();
