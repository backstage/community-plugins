import { createExtensionPoint } from '@backstage/backend-plugin-api';

import { GroupTransformer, UserTransformer } from './lib/types';

/**
 * An extension point that exposes the ability to implement user and group transformer functions for ping identity.
 *
 * @public
 */
export const pingIdentityTransformerExtensionPoint =
  createExtensionPoint<PingIdentityTransformerExtensionPoint>({
    id: 'pingIdentity.transformer',
  });

/**
 * The interface for {@link pingIdentityTransformerExtensionPoint}.
 *
 * @public
 */
export type PingIdentityTransformerExtensionPoint = {
  setUserTransformer(userTransformer: UserTransformer): void;
  setGroupTransformer(groupTransformer: GroupTransformer): void;
};
