import { createPermission } from '@backstage/plugin-permission-common';

export const argocdViewPermission = createPermission({
  name: 'argocd.view.read',
  attributes: {
    action: 'read',
  },
});

/**
 * List of all permissions on permission polices.
 */
export const argocdPermissions = [argocdViewPermission];
