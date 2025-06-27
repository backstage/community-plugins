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
  filters,
  clusterColumn,
  namespaceColumn,
  versionColumn,
  Cluster,
  availableComponentsColumn,
  clusterNameFilteringColumn,
  fluxUpdate,
} from '../helpers';
import { FluxEntityTable } from '../FluxEntityTable';
import { FluxControllerEnriched } from '../../objects';

export const defaultColumns: TableColumn<Cluster>[] = [
  clusterNameFilteringColumn(),
  idColumn(),
  clusterColumn(),
  namespaceColumn(),
  versionColumn(),
  availableComponentsColumn(),
  fluxUpdate(),
];

type Props = {
  deployments: FluxControllerEnriched[];
  isLoading: boolean;
  columns: TableColumn<Cluster>[];
  many?: boolean;
};

export const FluxRuntimeTable = ({
  deployments,
  isLoading,
  columns,
  many,
}: Props) => {
  let clusters: Cluster[] = [];
  deployments.forEach(deployment => {
    const cls = clusters.find(
      cluster => cluster.clusterName === deployment.clusterName,
    );
    if (cls) {
      cls.availableComponents = [
        ...cls.availableComponents,
        deployment.metadata.labels['app.kubernetes.io/component'],
      ];
    } else {
      clusters = [
        ...clusters,
        {
          clusterName: deployment.clusterName,
          namespace: deployment.metadata.namespace,
          version: deployment.metadata.labels['app.kubernetes.io/version'],
          availableComponents: [
            deployment.metadata.labels['app.kubernetes.io/component'],
          ],
        },
      ];
    }
  });

  const data = clusters.map(c => {
    const { clusterName, namespace, version, availableComponents } = c;
    return {
      id: `${namespace}/${clusterName}`,
      clusterName,
      namespace,
      version,
      availableComponents,
    } as Cluster & { id: string };
  });

  return (
    <FluxEntityTable
      title="flux controllers"
      columns={columns}
      data={data as Cluster[]}
      isLoading={isLoading}
      filters={filters}
      many={many}
    />
  );
};
