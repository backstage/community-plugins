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
  typeColumn,
  filters,
  imageRepository,
  policy,
  latestImageSelected,
} from '../helpers';
import { ImagePolicy } from '../../objects';
import { FluxEntityTable } from '../FluxEntityTable';

export const defaultColumns: TableColumn<ImagePolicy>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  typeColumn(),
  nameAndClusterNameColumn(),
  statusColumn(),
  policy(),
  imageRepository(),
  latestImageSelected(),
  updatedColumn(),
  actionColumn(),
];

type Props = {
  imagePolicies: ImagePolicy[];
  isLoading: boolean;
  columns: TableColumn<ImagePolicy>[];
  many?: boolean;
};

export const FluxImagePoliciesTable = ({
  imagePolicies,
  isLoading,
  columns,
  many,
}: Props) => {
  const data = imagePolicies.map(d => {
    const {
      clusterName,
      namespace,
      name,
      conditions,
      suspended,
      sourceRef,
      type,
      imagePolicy,
      imageRepositoryRef,
      latestImage,
    } = d;
    return {
      id: `${clusterName}/${namespace}/${name}`,
      conditions,
      suspended,
      name,
      namespace,
      clusterName,
      sourceRef,
      type,
      imagePolicy,
      imageRepositoryRef,
      latestImage,
    } as ImagePolicy & { id: string };
  });

  return (
    <FluxEntityTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
