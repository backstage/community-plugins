import { createBackendModule } from '@backstage/backend-plugin-api';
import { microsoftGraphOrgEntityProviderTransformExtensionPoint } from '@backstage/plugin-catalog-backend-module-msgraph/alpha';

import { UserEntity } from '@backstage/catalog-model';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

const MICROSOFT_GRAPH_USER_ID_ANNOTATION = 'graph.microsoft.com/user-id';

export async function myUserTransformer(
  user: MicrosoftGraph.User,
  userPhoto?: string,
): Promise<UserEntity | undefined> {
  if (!user.id || !user.displayName || !user.userPrincipalName) {
    return void 0;
  }
  const name = normalizeUserPrincipalName(user.userPrincipalName);
  const entity: UserEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name,
      annotations: {
        [MICROSOFT_GRAPH_USER_ID_ANNOTATION]: user.id!,
      },
    },
    spec: {
      profile: {
        displayName: user.displayName,
      },
      memberOf: [],
    },
  };
  if (user.mail) entity.spec.profile!.email = user.mail;
  if (userPhoto) entity.spec.profile!.picture = userPhoto;
  return entity;
}

export function normalizeUserPrincipalName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}

export const catalogModuleMsGraphTransformer = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'ms-graph-transformer',
  register(env) {
    env.registerInit({
      deps: {
        microsoftGraphTransformers:
          microsoftGraphOrgEntityProviderTransformExtensionPoint,
      },
      async init({ microsoftGraphTransformers }) {
        microsoftGraphTransformers.setUserTransformer(myUserTransformer);
      },
    });
  },
});