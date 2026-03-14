/*
 * Copyright 2020 The Backstage Authors
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
import { useEntity } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { GITHUB_ACTIONS_ANNOTATION } from '../getProjectNameFromEntity';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import {
  Tooltip,
  Text,
  Flex,
  TooltipTrigger,
  Card,
  CardHeader,
  CardBody,
  Table,
  useTable,
  Cell,
  CellText,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';

import { errorApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { ErrorPanel, Link } from '@backstage/core-components';
import { buildRouteRef } from '../../routes';
import { getHostnameFromEntity } from '../getHostnameFromEntity';

const firstLine = (message: string): string => message.split('\n')[0];

type WorkflowRunWithId = WorkflowRun & TableItem;

const createColumns = (
  routeLink: (params: { id: string }) => string,
): ColumnConfig<WorkflowRunWithId>[] => [
  {
    id: 'message',
    label: 'Commit Message',
    isRowHeader: true,
    cell: item => (
      <Cell>
        <Link component={RouterLink} to={routeLink({ id: String(item.id!) })}>
          {firstLine(item.message ?? '')}
        </Link>
      </Cell>
    ),
  },
  {
    id: 'branch',
    label: 'Branch',
    cell: item => {
      const text = item.source?.branchName ?? '';
      return <CellText title={text}>{text}</CellText>;
    },
  },
  {
    id: 'status',
    label: 'Status',
    cell: item => (
      <Cell>
        <Flex>
          <WorkflowRunStatus
            status={item.status}
            conclusion={item.conclusion}
          />
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'age',
    label: 'Age',
    cell: item => (
      <Cell>
        <Flex>
          <TooltipTrigger>
            <Text>{item.statusAge}</Text>
            <Tooltip>{item.statusDate ?? ''}</Tooltip>
          </TooltipTrigger>
        </Flex>
      </Cell>
    ),
  },
];

/** @public */
export const RecentWorkflowRunsCard = (props: {
  branch?: string;
  dense?: boolean;
  limit?: number;
}) => {
  const { branch, limit = 5 } = props;

  const { entity } = useEntity();
  const errorApi = useApi(errorApiRef);

  const hostname = getHostnameFromEntity(entity);

  const [owner, repo] = (
    entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '/'
  ).split('/');

  const [{ runs = [], loading, error }] = useWorkflowRuns({
    hostname,
    owner,
    repo,
    branch,
    initialPageSize: limit,
  });

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  const githubHost = hostname || 'github.com';
  const routeLink = useRouteRef(buildRouteRef);

  const runsWithId: WorkflowRunWithId[] = useMemo(
    () =>
      runs.map((run, index) => ({
        ...run,
        id: run.id ?? `workflow-${index}`,
      })),
    [runs],
  );

  const columnConfig = useMemo(() => createColumns(routeLink), [routeLink]);

  const { tableProps } = useTable({
    mode: 'complete',
    data: runsWithId,
  });

  if (error) {
    return <ErrorPanel title={error.message} error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <Flex direction="column" gap="1">
          <Text variant="title-medium">Recent Workflow Runs</Text>
          {branch && (
            <Text variant="body-small" color="secondary">
              Branch: {branch}
            </Text>
          )}
          {!branch && (
            <Text variant="body-small" color="secondary">
              All Branches
            </Text>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          loading={loading}
          emptyState={
            <div style={{ textAlign: 'center', padding: 'var(--bui-space-4)' }}>
              <Text variant="body-medium">
                This component has GitHub Actions enabled, but no workflows were
                found.
              </Text>
              <Text variant="body-small">
                <Link to={`https://${githubHost}/${owner}/${repo}/actions/new`}>
                  Create a new workflow
                </Link>
              </Text>
            </div>
          }
        />
      </CardBody>
    </Card>
  );
};
