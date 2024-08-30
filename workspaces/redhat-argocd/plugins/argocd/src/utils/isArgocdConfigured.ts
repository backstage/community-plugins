import { Entity } from '@backstage/catalog-model';

import { ArgoCdLabels } from './utils';

export const isArgocdConfigured = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[ArgoCdLabels.appSelector]) ||
  Boolean(entity?.metadata.annotations?.[ArgoCdLabels.appName]);
