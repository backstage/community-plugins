import { createPermission } from '@backstage/plugin-permission-common';
import { RESOURCE_TYPE_CATALOG_ENTITY } from '@backstage/plugin-catalog-common/alpha';

/**
 * @public
 */
export const blackduckRiskProfileReadPermission = createPermission({
  name: 'blackduck.riskprofile.read',
  attributes: { action: 'read' },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

/**
 * @public
 */
export const blackduckVulnerabilitiesReadPermission = createPermission({
  name: 'blackduck.vulnerabilities.read',
  attributes: { action: 'read' },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

/**
 * @public
 */
export const blackduckPermissions = [
  blackduckVulnerabilitiesReadPermission,
  blackduckRiskProfileReadPermission,
];
