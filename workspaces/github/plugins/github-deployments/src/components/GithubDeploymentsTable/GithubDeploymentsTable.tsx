/*
 * Copyright 2021 The Backstage Authors
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
import { GithubDeployment } from '../../api';
import { Text } from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';
import { columnFactories } from './columns';
import { defaultDeploymentColumns } from './presets';
import { Table, TableColumn } from '@backstage/core-components';
import styles from './GithubDeploymentsTable.module.css';

/** @public */
export const GithubDeploymentsTable = (props: {
  deployments: GithubDeployment[];
  isLoading: boolean;
  reload: () => void;
  columns: TableColumn<GithubDeployment>[];
}) => {
  const { deployments, isLoading, reload, columns } = props;

  return (
    <Table
      columns={columns}
      options={{ padding: 'dense', paging: true, search: false, pageSize: 5 }}
      title="GitHub Deployments"
      data={deployments}
      isLoading={isLoading}
      actions={[
        {
          icon: () => <RiRefreshLine size={20} />,
          tooltip: 'Reload',
          isFreeAction: true,
          onClick: () => reload(),
        },
      ]}
      emptyContent={
        <div className={styles.empty}>
          <Text variant="body-medium">
            No deployments found for this entity.
          </Text>
        </div>
      }
    />
  );
};

GithubDeploymentsTable.columns = columnFactories;

GithubDeploymentsTable.defaultDeploymentColumns = defaultDeploymentColumns;
