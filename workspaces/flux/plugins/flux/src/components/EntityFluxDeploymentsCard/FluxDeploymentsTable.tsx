/*
 * Copyright 2025 The Backstage Authors
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
import { TableColumn } from '@backstage/core-components';
import {
  clusterNameFilteringColumn,
  idColumn,
  nameAndClusterNameColumn,
  statusColumn,
  updatedColumn,
  actionColumn,
  Deployment,
  repoColumn,
  sourceColumn,
  typeColumn,
  filters,
} from '../helpers';
import { HelmChart, HelmRelease, Kustomization } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<Deployment>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  repoColumn(),
  sourceColumn(),
  statusColumn(),
  updatedColumn(),
  actionColumn(),
];

type Props = {
  deployments: Deployment[];
  isLoading: boolean;
  columns: TableColumn<Deployment>[];
  many?: boolean;
};

export const FluxDeploymentsTable = ({
  deployments,
  isLoading,
  columns,
  many,
}: Props) => {
  let helmChart = {} as HelmChart;
  let path = '';

  const data = deployments.map(d => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      sourceRef,
      type,
      lastAppliedRevision,
    } = d;
    if (d instanceof Kustomization) {
      path = d.path;
      return {
        id: `${clusterName}/${namespace}/${name}`,
        conditions,
        suspended,
        name,
        namespace,
        lastAppliedRevision,
        clusterName,
        sourceRef,
        type,
        path,
      } as Kustomization & { id: string };
    } else if (d instanceof HelmRelease) {
      helmChart = d.helmChart;
      return {
        id: `${clusterName}/${namespace}/${name}`,
        conditions,
        suspended,
        name,
        namespace,
        lastAppliedRevision,
        clusterName,
        sourceRef,
        type,
        helmChart,
      } as HelmRelease & { id: string };
    }
    return null;
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={
        data as (
          | (HelmRelease & { id: string })
          | (Kustomization & { id: string })
        )[]
      }
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
