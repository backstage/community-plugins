/*
 * Copyright 2023 The Backstage Authors
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
import { ReactElement, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Cell,
  CellText,
  Flex,
  SearchField,
  Table,
  Text,
  useTable,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';
import {
  OctopusEnvironment,
  OctopusPluginConfig,
  OctopusProject,
  OctopusReleaseProgression,
} from '../../api';

import {
  Link,
  ResponseErrorPanel,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';
import { OctopusDeployIcon } from '../OctopusDeployIcon';
import styles from './ReleaseTable.module.css';

type ReleaseTableProps = {
  environments?: OctopusEnvironment[];
  releases?: OctopusReleaseProgression[];
  project?: OctopusProject;
  config?: OctopusPluginConfig;
  loading: boolean;
  error?: Error;
};

type ReleaseRow = OctopusReleaseProgression & TableItem;

export const getDeploymentStatusComponent = (state: string | undefined) => {
  switch (state) {
    case 'Success':
      return <StatusOK>Success</StatusOK>;
    case 'Queued':
      return <StatusPending>Queued</StatusPending>;
    case 'Executing':
      return <StatusRunning>Executing</StatusRunning>;
    case 'Failed':
      return <StatusError>Failed</StatusError>;
    case 'Cancelling':
      return <StatusPending>Cancelling</StatusPending>;
    case 'Canceled':
      return <StatusAborted>Canceled</StatusAborted>;
    case 'TimedOut':
      return <StatusWarning>Timed Out</StatusWarning>;
    default:
      return <StatusWarning>Unknown</StatusWarning>;
  }
};

const getLatestDeploymentState = (
  row: OctopusReleaseProgression,
  environmentId: string,
): string | undefined => row.Deployments?.[environmentId]?.[0]?.State;

const createColumns = (
  environments: OctopusEnvironment[],
  config?: OctopusPluginConfig,
): ColumnConfig<ReleaseRow>[] => [
  {
    id: 'version',
    label: 'Version',
    isRowHeader: true,
    cell: (row): ReactElement => {
      const version = row.Release?.Version;
      const externalLink =
        config?.WebUiBaseUrl && row.Release?.Links.Web
          ? `${config.WebUiBaseUrl}${row.Release.Links.Web}`
          : undefined;
      return (
        <Cell>
          {externalLink && version ? (
            <Link to={externalLink} title="Open Detail in Octopus">
              {version}
            </Link>
          ) : (
            <Text>{version ?? 'Unknown'}</Text>
          )}
        </Cell>
      );
    },
  },
  ...environments.map(
    (env): ColumnConfig<ReleaseRow> => ({
      id: env.Id,
      label: env.Name,
      cell: (row): ReactElement => {
        const state = getLatestDeploymentState(row, env.Id);
        return state ? (
          <Cell>{getDeploymentStatusComponent(state)}</Cell>
        ) : (
          <CellText title="" />
        );
      },
    }),
  ),
];

export const ReleaseTable = ({
  environments,
  releases,
  project,
  config,
  loading,
  error,
}: ReleaseTableProps) => {
  const rows: ReleaseRow[] = useMemo(
    () =>
      (releases ?? []).map((release, index) => ({
        ...release,
        id: release.Release?.Id ?? `release-${index}`,
      })),
    [releases],
  );

  const columnConfig = useMemo(
    () => createColumns(environments ?? [], config),
    [environments, config],
  );

  const { tableProps, search } = useTable({
    mode: 'complete',
    // Without data the table shows its loading skeleton instead of empty rows
    data: loading && rows.length === 0 ? undefined : rows,
    paginationOptions: { pageSize: 5 },
    searchFn: (data, query) => {
      const needle = query.trim().toLocaleLowerCase('en-US');
      if (!needle) {
        return data;
      }
      return data.filter(
        row =>
          row.Release?.Version?.toLocaleLowerCase('en-US').includes(needle) ||
          (environments ?? []).some(env =>
            getLatestDeploymentState(row, env.Id)
              ?.toLocaleLowerCase('en-US')
              .includes(needle),
          ),
      );
    },
  });

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const externalLink =
    config?.WebUiBaseUrl && project?.Links.Web
      ? `${config.WebUiBaseUrl}${project.Links.Web}`
      : undefined;
  const projectTitle = externalLink ? (
    <Link to={externalLink} title="Open project in Octopus">
      {project?.Name}
    </Link>
  ) : (
    project?.Name ?? 'Unknown'
  );

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center" className={styles.header}>
          <Flex align="center" gap="2">
            <OctopusDeployIcon size={30} />
            <Text as="h2" variant="title-small">
              Octopus Deploy - {projectTitle} ({releases ? releases.length : 0})
            </Text>
          </Flex>
          <SearchField
            aria-label="Search releases"
            placeholder="Search"
            size="small"
            value={search.value}
            onChange={search.onChange}
          />
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          isPending={loading}
          emptyState={
            loading ? undefined : (
              <Text color="secondary">No releases found.</Text>
            )
          }
        />
      </CardBody>
    </Card>
  );
};
