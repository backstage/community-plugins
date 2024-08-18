import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint  } from '@backstage/plugin-scaffolder-node/alpha';
import { runAzurePipelineAction } from "./example/example";
import { ScmIntegrations } from '@backstage/integration';

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'azure:pipelines',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolderActions, config}) {
        const integrations = ScmIntegrations.fromConfig(config);
        scaffolderActions.addActions(runAzurePipelineAction({integrations,config}));
      }
    });
  },
})
