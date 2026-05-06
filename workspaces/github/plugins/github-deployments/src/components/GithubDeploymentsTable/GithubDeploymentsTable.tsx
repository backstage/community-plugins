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
import {
  Text,
  Table,
  Flex,
  ButtonIcon,
  Card,
  CardHeader,
  CardBody,
  Cell,
  CellText,
  useTable,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';
import {
  StatusPending,
  StatusRunning,
  StatusOK,
  StatusAborted,
  StatusError,
  Link,
} from '@backstage/core-components';
import { DateTime } from 'luxon';
import styles from './GithubDeploymentsTable.module.css';
import { useMemo } from 'react';
import { ReactElement } from 'react';

type GithubDeploymentWithId = GithubDeployment & TableItem;

const GithubStateIndicator = (props: { state: string }) => {
  switch (props.state) {
    case 'PENDING':
      return <StatusPending />;
    case 'IN_PROGRESS':
      return <StatusRunning />;
    case 'ACTIVE':
      return <StatusOK />;
    case 'ERROR':
    case 'FAILURE':
      return <StatusError />;
    default:
      return <StatusAborted />;
  }
};

const createColumns = (): ColumnConfig<GithubDeploymentWithId>[] => [
  {
    id: 'environment',
    label: 'Environment',
    isRowHeader: true,
    cell: (item): ReactElement => {
      const text = item.environment;
      return <CellText title={text}>{text}</CellText>;
    },
  },
  {
    id: 'status',
    label: 'Status',
    cell: (item): ReactElement => (
      <Cell>
        <Flex align="center">
          <GithubStateIndicator state={item.state} />
          <Text variant="body-x-small">{item.state}</Text>
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'commit',
    label: 'Commit',
    cell: (item): ReactElement => (
      <Cell>
        {item.commit && (
          <Link to={item.commit.commitUrl} target="_blank" rel="noopener">
            {item.commit.abbreviatedOid}
          </Link>
        )}
      </Cell>
    ),
  },
  {
    id: 'creator',
    label: 'Creator',
    cell: (item): ReactElement => {
      const text = item.creator.login;
      return <CellText title={text}>{text}</CellText>;
    },
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    cell: (item): ReactElement => (
      <Cell>
        <div>
          {DateTime.fromISO(item.updatedAt).toRelative({ locale: 'en' })}
        </div>
      </Cell>
    ),
  },
];

/** @public */
export const GithubDeploymentsTable = (props: {
  deployments: GithubDeployment[];
  isLoading: boolean;
  reload: () => void;
}) => {
  const { deployments, isLoading, reload } = props;

  const deploymentsWithId: GithubDeploymentWithId[] = useMemo(
    () =>
      deployments.map(deployment => ({
        ...deployment,
        id: `${deployment.environment}-${deployment.updatedAt}-${deployment.creator.login}`,
      })),
    [deployments],
  );

  const columnConfig = useMemo(() => createColumns(), []);

  const { tableProps } = useTable({
    mode: 'complete',
    data: deploymentsWithId,
    paginationOptions: {
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
    },
  });

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text variant="title-medium">GitHub Deployments</Text>
          <ButtonIcon
            aria-label="Reload"
            icon={<RiRefreshLine size={20} />}
            onPress={reload}
            variant="secondary"
          />
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          loading={isLoading}
          emptyState={
            <div className={styles.empty}>
              <Text variant="body-medium">
                No deployments found for this entity.
              </Text>
            </div>
          }
        />
      </CardBody>
    </Card>
  );
};
