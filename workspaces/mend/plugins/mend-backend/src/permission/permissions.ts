import { createPermission } from '@backstage/plugin-permission-common';

/** @public */
export enum RESOURCE_TYPE {
  PROJECT = 'mend-project',
}

/** @public */
export const mendReadPermission = createPermission({
  name: 'mend.project.read',
  attributes: { action: 'read' },
  resourceType: RESOURCE_TYPE.PROJECT,
});

export const mendPermissions = [mendReadPermission];
