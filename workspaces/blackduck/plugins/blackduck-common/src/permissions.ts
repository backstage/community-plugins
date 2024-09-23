/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
