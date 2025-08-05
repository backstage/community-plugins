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
import { RequirePermission } from '@backstage/plugin-permission-react';

import { ocmEntityReadPermission } from '@backstage-community/plugin-ocm-common';

import { useCluster } from '../ClusterContext';
import { Status, Update } from '../common';
import { TableCardFromData } from '../TableCardFromData';

/**
 * @public
 */
export const ClusterInfoCard = () => {
  const { data } = useCluster();

  if (!data) {
    return null;
  }

  data.openshiftVersion = (
    <Update data={{ version: data.openshiftVersion!, update: data.update! }} />
  ) as any;
  data.status = (<Status status={data.status} />) as any;
  const nameMap = new Map<string, string>([
    ['name', 'Name'],
    ['status', 'Status'],
    ['kubernetesVersion', 'Kubernetes version'],
    ['openshiftId', 'OpenShift ID'],
    ['openshiftVersion', 'OpenShift version'],
    ['platform', 'Platform'],
  ]);
  return (
    <RequirePermission permission={ocmEntityReadPermission}>
      <TableCardFromData data={data} title="Cluster Info" nameMap={nameMap} />
    </RequirePermission>
  );
};
