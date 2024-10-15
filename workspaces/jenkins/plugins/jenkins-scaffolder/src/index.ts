import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { jenkinsCreateJobAction } from './action';

/**
 * @public
 */
export const jenkinsJobCreate = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'jenkins:job:create',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(jenkinsCreateJobAction({ config: config }));
      },
    });
  },
});

export { jenkinsJobCreate as default };
