/**
 * index.ts — @backstage-community/plugin-aws-oidc-backend
 *
 * Exports two Backstage backend features:
 *
 * 1. awsOidcPlugin  (createBackendPlugin)
 *    Mounts OIDC discovery endpoints at /api/aws-oidc/*
 *    Register: backend.add(import('@backstage-community/plugin-aws-oidc-backend'))
 *
 * 2. awsOidcScaffolderModule  (createBackendModule)  — see scaffolderModule.ts
 *    Registers the aws:assumeRole Scaffolder action
 *    Register: backend.add(import('@backstage-community/plugin-aws-oidc-backend/scaffolder'))
 *
 * Config (app-config.yaml):
 *
 *   awsOidc:
 *     issuer: "${BACKSTAGE_URL}/api/aws-oidc"   # must be publicly reachable by AWS IAM
 *     mode: kms                                  # "kms" | "localKey" | "mock"
 *     kmsKeyId: "${AWS_OIDC_KMS_KEY_ID}"         # required when mode=kms
 *     region: "${AWS_REGION}"                    # required when mode=kms
 *     localPrivateKeyPath: "./dev-key.pem"        # required when mode=localKey
 */

import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { KmsService, OidcMode } from './kmsService';
import { createRouter } from './router';

// Re-export services so other backend plugins can reuse the OIDC credential
// flow without duplicating KMS / STS logic.
export { KmsService } from './kmsService';
export type { OidcMode, JwtClaims } from './kmsService';
export { StsService } from './stsService';
export type { AwsCredentials, AssumeRoleOptions } from './stsService';

export const awsOidcPlugin = createBackendPlugin({
  pluginId: 'aws-oidc',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, logger, httpRouter }) {
        const issuer = config.getString('awsOidc.issuer');
        const mode = (config.getOptionalString('awsOidc.mode') ??
          'kms') as OidcMode;

        const kmsService = new KmsService({
          mode,
          kmsKeyId: config.getOptionalString('awsOidc.kmsKeyId'),
          region: config.getOptionalString('awsOidc.region'),
          localPrivateKeyPath: config.getOptionalString(
            'awsOidc.localPrivateKeyPath',
          ),
          logger,
        });

        const router = createRouter({ kmsService, issuer, logger });

        httpRouter.use(router);
        // OIDC discovery and JWKS must be publicly accessible — AWS IAM calls
        // these endpoints when verifying tokens during AssumeRoleWithWebIdentity.
        httpRouter.addAuthPolicy({
          path: '/.well-known/openid-configuration',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/.well-known/jwks.json',
          allow: 'unauthenticated',
        });

        logger.info(
          `[aws-oidc] Plugin started — issuer=${issuer} mode=${mode}`,
        );
      },
    });
  },
});

export default awsOidcPlugin;
