/*
 * Copyright 2026 The Backstage Authors
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

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useMemo } from 'react';
import { DashboardOrganizationHost } from '@backstage-community/plugin-azure-devops-common';

/**
 * React hook that returns the list of organizations from the
 * azureDevOps.pullRequestDashboard.organizations config.
 *
 * @returns DashboardOrganizationHost[] - Array of organization and host objects
 */
export function useOrganizations(): DashboardOrganizationHost[] {
  const config = useApi(configApiRef);

  return useMemo(() => {
    const organizations = config.getOptionalConfigArray(
      'azureDevOps.pullRequestDashboard.organizations',
    );

    const legacyHost = config.getOptionalString('azureDevOps.host');
    const legacyOrg = config.getOptionalString('azureDevOps.organization');

    const orgList: DashboardOrganizationHost[] = organizations
      ? organizations.map(org => ({
          organization: org.getString('organization'),
          host: org.getString('host'),
        }))
      : [];

    // Add legacy configuration if it exists and isn't already in the list
    if (legacyHost && legacyOrg) {
      const alreadyExists = orgList.some(
        org => org.organization === legacyOrg && org.host === legacyHost,
      );
      if (!alreadyExists) {
        orgList.push({
          organization: legacyOrg,
          host: legacyHost,
        });
      }
    }

    return orgList;
  }, [config]);
}
