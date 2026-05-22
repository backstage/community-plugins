/**
 * router.ts — OIDC discovery endpoints for aws-oidc-backend
 *
 * Mounts two routes under the plugin's base path (/api/aws-oidc/):
 *
 *   GET /.well-known/openid-configuration
 *       Standard OIDC discovery document. AWS IAM reads this when you register
 *       an OIDC Identity Provider pointing at your Backstage URL.
 *
 *   GET /.well-known/jwks.json
 *       JSON Web Key Set. AWS fetches this to verify JWT signatures when
 *       AssumeRoleWithWebIdentity is called.
 *
 * Both endpoints are unauthenticated — AWS must be able to reach them without
 * any auth headers.
 */

import { Router, Request, Response } from 'express';
import { KmsService } from './kmsService';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface RouterOptions {
  kmsService: KmsService;
  /** Full issuer URL — e.g. https://backstage.daon.com/api/aws-oidc */
  issuer: string;
  logger: LoggerService;
}

export function createRouter(options: RouterOptions): Router {
  const { kmsService, issuer, logger } = options;
  const router = Router();

  /**
   * OIDC Discovery Document
   * Spec: https://openid.net/specs/openid-connect-discovery-1_0.html
   *
   * AWS IAM fetches: {issuer}/.well-known/openid-configuration
   * Because our issuer IS the plugin base path, this route handles it directly.
   */
  router.get(
    '/.well-known/openid-configuration',
    (_req: Request, res: Response) => {
      logger.debug('[aws-oidc] Serving OIDC discovery document');
      res.json({
        issuer,
        jwks_uri: `${issuer}/.well-known/jwks.json`,
        response_types_supported: ['id_token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat'],
      });
    },
  );

  /**
   * JSON Web Key Set
   * Returns the public key(s) used to verify JWT signatures.
   * AWS caches this but re-fetches periodically or when a new key is seen.
   */
  router.get('/.well-known/jwks.json', async (_req: Request, res: Response) => {
    try {
      logger.debug('[aws-oidc] Serving JWKS');
      const jwks = await kmsService.getJwks();
      // Cache for 1 hour — AWS respects Cache-Control when refreshing keys
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.json(jwks);
    } catch (err) {
      logger.error(`[aws-oidc] Failed to build JWKS: ${err}`);
      res.status(500).json({ error: 'Failed to retrieve public key set' });
    }
  });

  return router;
}
