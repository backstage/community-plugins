import { createPermission } from '@backstage/plugin-permission-common';

export enum RESOURCE_TYPE {
  PROJECT = 'mend-project',
}

export const mendReadPermission = createPermission({
  name: 'mend.project.read',
  attributes: { action: 'read' },
  resourceType: RESOURCE_TYPE.PROJECT,
});

export const mendPermissions = [mendReadPermission];
