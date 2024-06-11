import { createPermission } from '@backstage/plugin-permission-common';
import { RESOURCE_TYPE_CATALOG_ENTITY } from '@backstage/plugin-catalog-common/alpha';

/**
 * @public
 */
export const vaultEntityReadPermission = createPermission({
    name: 'vault.entity.read',
    attributes: { action: 'read' },
    resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

/**
 * @public
 */
export const vaultEntityPermissions = [vaultEntityReadPermission];
