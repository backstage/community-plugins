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
  idColumn,
  nameAndClusterNameColumn,
  urlColumn,
  statusColumn,
  updatedColumn,
  actionColumn,
  Source,
  artifactColumn,
  typeColumn,
  verifiedColumn,
  clusterNameFilteringColumn,
  filters,
} from '../helpers';
import { GitRepository, HelmRepository, OCIRepository } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';
import { GH, OH } from './EntityFluxSourcesCard';

const commonInitialColumns: TableColumn<Source>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
];

const commonEndColumns: TableColumn<Source>[] = [
  urlColumn(),
  artifactColumn(),
  statusColumn(),
  updatedColumn(),
  actionColumn(),
];

export const sourceDefaultColumns = [
  ...commonInitialColumns,
  verifiedColumn(),
  { title: 'Provider', field: 'provider' },
  ...commonEndColumns,
] as TableColumn<GH | OH>[];

export const gitOciDefaultColumns = [
  ...commonInitialColumns,
  verifiedColumn(),
  ...commonEndColumns,
] as TableColumn<GitRepository | OCIRepository>[];

export const helmDefaultColumns = [
  ...commonInitialColumns,
  { title: 'Provider', field: 'provider' },
  ...commonEndColumns,
] as TableColumn<HelmRepository>[];

type Props = {
  sources: Source[];
  isLoading: boolean;
  columns: TableColumn<any>[];
  many?: boolean;
};

export const FluxSourcesTable = ({
  sources,
  isLoading,
  columns,
  many,
}: Props) => {
  let provider = '';
  let isVerifiable = false;

  const data = sources.map(repo => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      url,
      type,
      artifact,
    } = repo;
    const cols = {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      url,
      clusterName,
      type,
      artifact,
    };
    if (repo instanceof HelmRepository) {
      provider = repo.provider;
      return {
        ...cols,
        provider,
      } as HelmRepository & { id: string };
    }
    isVerifiable = repo.isVerifiable;
    return {
      ...cols,
      isVerifiable,
    } as Source & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={
        data as (
          | (OCIRepository & { id: string })
          | (HelmRepository & { id: string })
          | (GitRepository & { id: string })
        )[]
      }
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
