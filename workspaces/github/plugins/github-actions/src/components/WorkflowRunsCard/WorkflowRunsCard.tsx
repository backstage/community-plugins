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
import { useEffect, useState, useMemo, Key } from 'react';
import {
  Text,
  Flex,
  Button,
  ButtonIcon,
  TextField,
  Alert,
  Tooltip,
  Grid,
  TooltipTrigger,
  Card,
  CardHeader,
  CardBody,
  Select,
} from '@backstage/ui';
import TablePagination from '@material-ui/core/TablePagination';
import {
  RiGithubLine,
  RiRefreshLine,
  RiRestartLine,
  RiExternalLinkLine,
} from '@remixicon/react';
import {
  LinkButton,
  Link,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { WorkflowIcon } from '../WorkflowRunStatus/WorkflowRunStatus';
import { buildRouteRef } from '../../routes';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import { Entity } from '@backstage/catalog-model';
import styles from './WorkflowRunsCard.module.css';

const statusColors: Record<string, 'info' | 'success' | 'warning' | 'danger'> =
  {
    skipped: 'warning',
    canceled: 'info',
    timed_out: 'danger',
    failure: 'danger',
    success: 'success',
  };

const matchesSearchTerm = (run: WorkflowRun, searchTerm: string) => {
  const lowerCaseSearchTerm = searchTerm.toLocaleLowerCase();
  return (
    run.workflowName?.toLocaleLowerCase().includes(lowerCaseSearchTerm) ||
    run.source.branchName?.toLocaleLowerCase().includes(lowerCaseSearchTerm) ||
    run.status?.toLocaleLowerCase().includes(lowerCaseSearchTerm) ||
    run.id?.toLocaleLowerCase().includes(lowerCaseSearchTerm)
  );
};

type WorkflowRunsCardViewProps = {
  runs?: WorkflowRun[];
  searchTerm: string;
  loading: boolean;
  onChangePageSize: (pageSize: number) => void;
  onChangePage: (page: number) => void;
  page: number;
  total: number;
  pageSize: number;
  projectName: string;
};

export const WorkflowRunsCardView = ({
  runs,
  searchTerm,
  loading,
  onChangePageSize,
  onChangePage,
  page,
  total,
  pageSize,
}: WorkflowRunsCardViewProps) => {
  const routeLink = useRouteRef(buildRouteRef);

  const filteredRuns = runs?.filter(run => matchesSearchTerm(run, searchTerm));

  return (
    <Grid.Root columns={{ sm: '12' }} gap="6">
      {filteredRuns && runs?.length !== 0 ? (
        filteredRuns.map(run => (
          <Grid.Item key={run.id} colSpan={{ sm: '12', lg: '4' }}>
            <div className={styles.card}>
              <Flex
                direction="column"
                style={{ padding: 'var(--bui-space-4)', height: '100%' }}
              >
                <TooltipTrigger>
                  <Alert
                    status={
                      statusColors[run.conclusion as keyof typeof statusColors]
                    }
                    title={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--bui-space-2)',
                        }}
                      >
                        <div
                          style={{
                            transform: 'scale(1.5)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <WorkflowIcon
                            status={run.status}
                            conclusion={run.conclusion}
                          />
                        </div>
                        <Link
                          to={routeLink({ id: run.id })}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Text variant="title-small">{run.workflowName}</Text>
                        </Link>
                      </div>
                    }
                    style={{
                      alignItems: 'center',
                      marginBottom: 'var(--bui-space-4)',
                    }}
                  />
                  <Tooltip>{run.status ?? 'No Status'}</Tooltip>
                </TooltipTrigger>

                <StructuredMetadataTable
                  metadata={{
                    commit: (
                      <TooltipTrigger>
                        <Text style={{ overflowWrap: 'break-word' }}>
                          {run.source.commit.hash!}
                        </Text>
                        <Tooltip>{run.message ?? 'No run message'}</Tooltip>
                      </TooltipTrigger>
                    ),
                    ...(run.source.branchName && {
                      branch: (
                        <Text style={{ overflowWrap: 'break-word' }}>
                          {run.source.branchName}
                        </Text>
                      ),
                    }),
                    'workflow id': (
                      <Text style={{ overflowWrap: 'break-word' }}>
                        {run.id}
                      </Text>
                    ),
                    status: (
                      <Flex>
                        <WorkflowRunStatus
                          status={run.status}
                          conclusion={run.conclusion}
                        />
                      </Flex>
                    ),
                    age: (
                      <TooltipTrigger>
                        <Text>{run.statusAge}</Text>
                        <Tooltip>{run.statusDate ?? ''}</Tooltip>
                      </TooltipTrigger>
                    ),
                  }}
                />

                <Flex
                  direction="column"
                  gap="2"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--bui-space-4)',
                  }}
                >
                  <Button variant="secondary" onClick={run.onReRunClick}>
                    Rerun workflow <RiRestartLine size={16} />
                  </Button>

                  {run.githubUrl && (
                    <LinkButton
                      to={run.githubUrl}
                      endIcon={<RiExternalLinkLine size={14} />}
                    >
                      View on GitHub
                    </LinkButton>
                  )}
                </Flex>
              </Flex>
            </div>
          </Grid.Item>
        ))
      ) : (
        <Grid.Item colSpan={{ sm: '12' }}>
          <div style={{ padding: 'var(--bui-space-4)' }}>
            {loading ? <Progress /> : 'No matching runs found.'}
          </div>
        </Grid.Item>
      )}
      <Grid.Item colSpan={{ sm: '12' }}>
        <div className={styles.pagination}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => onChangePage(newPage)}
            onRowsPerPageChange={event =>
              onChangePageSize(parseInt(event.target.value, 10))
            }
            labelRowsPerPage="Workflows per page"
            rowsPerPageOptions={[6, 12, 18, { label: 'All', value: -1 }]}
          />
        </div>
      </Grid.Item>
    </Grid.Root>
  );
};

type WorkflowRunsCardProps = {
  entity: Entity;
};

const WorkflowRunsCardSearch = ({
  searchTerm,
  setSearchTerm,
  retry,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  retry: () => void;
}) => {
  return (
    <>
      <TextField
        placeholder="Filter..."
        value={searchTerm}
        onChange={setSearchTerm}
        data-testid="search-control"
        style={{ flex: '1 1 auto', marginRight: '20px' }}
      />

      <TooltipTrigger>
        <ButtonIcon
          aria-label="Reload workflow runs"
          onPress={retry}
          icon={<RiRefreshLine size={16} />}
          variant="secondary"
        />
        <Tooltip>Reload workflow runs</Tooltip>
      </TooltipTrigger>
    </>
  );
};

export const WorkflowRunsCard = ({ entity }: WorkflowRunsCardProps) => {
  const projectName = getProjectNameFromEntity(entity);
  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (projectName ?? '/').split('/');
  const [branch, setBranch] = useState<string | undefined>('default');
  const [runs, setRuns] = useState<WorkflowRun[] | undefined>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [
    { runs: runsData, branches, defaultBranch, ...cardProps },
    { retry, setPage, setPageSize },
  ] = useWorkflowRuns({
    hostname,
    owner,
    repo,
    branch: branch === 'all' ? undefined : branch,
    fetchAllBranches: true,
  });

  const handleMenuChange = (key: Key | Key[] | null) => {
    if (key !== null && !Array.isArray(key)) {
      const value = String(key);
      setBranch(value);
      setPage(0);
      retry();
    }
  };

  const branchOptions = useMemo(() => {
    return [
      ...branches.map(branchItem => ({
        value: branchItem.name,
        label:
          branchItem.name === defaultBranch
            ? `${branchItem.name} (default)`
            : branchItem.name,
      })),
      { value: 'all', label: 'select all branches' },
    ];
  }, [branches, defaultBranch]);

  useEffect(() => {
    setRuns(runsData);
  }, [runsData, branch]);

  useEffect(() => {
    setBranch(defaultBranch);
  }, [defaultBranch]);

  return (
    <Card>
      <CardHeader>
        <Flex align="center" justify="between">
          <Flex align="center" style={{ flex: '1 1 auto' }}>
            <RiGithubLine size={20} />
            <Text variant="title-medium">{projectName}</Text>

            <Select
              value={branch}
              onChange={handleMenuChange}
              options={branchOptions}
              data-testid="menu-control"
              size="small"
              searchable
              searchPlaceholder="Search branches..."
              style={{
                marginLeft: '30px',
                marginRight: '20px',
                width: '230px',
              }}
            />
          </Flex>

          <Flex align="center" style={{ flex: '0 0 33.333%' }}>
            <WorkflowRunsCardSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              retry={retry}
            />
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        <WorkflowRunsCardView
          runs={runs}
          loading={cardProps.loading}
          onChangePageSize={setPageSize}
          onChangePage={setPage}
          page={cardProps.page}
          total={cardProps.total}
          pageSize={cardProps.pageSize}
          searchTerm={searchTerm}
          projectName={projectName}
        />
      </CardBody>
    </Card>
  );
};

export default WorkflowRunsCard;
