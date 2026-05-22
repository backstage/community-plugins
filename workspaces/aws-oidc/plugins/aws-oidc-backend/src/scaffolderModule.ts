/**
 * scaffolderModule.ts — aws:assumeRole Scaffolder module
 *
 * Registers the aws:assumeRole action with the Backstage Scaffolder plugin.
 * Attach to the scaffolder plugin via the scaffolderActionsExtensionPoint.
 *
 * Register in packages/backend/src/index.ts:
 *   backend.add(import('@backstage-community/plugin-aws-oidc-backend/scaffolder'))
 */

import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { KmsService, OidcMode } from './kmsService';
import { StsService } from './stsService';
import { createAwsAssumeRoleAction } from './scaffolderAction';

export const awsOidcScaffolderModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'aws-oidc',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scaffolder: scaffolderActionsExtensionPoint,
        catalog: catalogServiceRef,
      },
      async init({ config, logger, scaffolder, catalog }) {
        const issuer = config.getString('awsOidc.issuer');
        const mode = (config.getOptionalString('awsOidc.mode') ??
          'kms') as OidcMode;
        const region = config.getOptionalString('awsOidc.region');

        const kmsService = new KmsService({
          mode,
          kmsKeyId: config.getOptionalString('awsOidc.kmsKeyId'),
          region,
          localPrivateKeyPath: config.getOptionalString(
            'awsOidc.localPrivateKeyPath',
          ),
          logger,
        });

        const stsService = new StsService({ mode, region, logger });

        scaffolder.addActions(
          createAwsAssumeRoleAction({
            kmsService,
            stsService,
            catalogService: catalog,
            issuer,
          }),
        );

        logger.info(
          `[aws-oidc] aws:assumeRole scaffolder action registered — mode=${mode}`,
        );
      },
    });
  },
});

export default awsOidcScaffolderModule;
