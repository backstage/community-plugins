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
import { useEffect, useState } from 'react';
import {
  Text,
  Flex,
  Button,
  ButtonIcon,
  TextField,
  Alert,
} from '@backstage/ui';
import { Tooltip, Grid, TooltipTrigger } from '@backstage/ui';
import CircularProgress from '@material-ui/core/CircularProgress';
import TablePagination from '@material-ui/core/TablePagination';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import {
  RiGithubLine,
  RiRefreshLine,
  RiRestartLine,
  RiExternalLinkLine,
} from '@remixicon/react';
import { LinkButton, Link, InfoCard } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
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
          <Grid.Item key={run.id} colSpan={{ sm: '12', lg: '6' }}>
            <div className={styles.card}>
              <Flex
                direction="column"
                style={{ padding: 'var(--bui-space-4)', height: '100%' }}
                align="center"
              >
                <div
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <TooltipTrigger>
                    <Alert
                      status={
                        statusColors[
                          run.conclusion as keyof typeof statusColors
                        ]
                      }
                      title={
                        <Link to={routeLink({ id: run.id })}>
                          <Text variant="title-small">{run.workflowName}</Text>
                        </Link>
                      }
                      style={{ alignItems: 'center' }}
                    />
                    <Tooltip>{run.status ?? 'No Status'}</Tooltip>
                  </TooltipTrigger>
                  <TooltipTrigger>
                    <Flex
                      direction="column"
                      style={{
                        marginTop: 'var(--bui-space-2)',
                        marginBottom: 'var(--bui-space-2)',
                      }}
                    >
                      <Text variant="body-small">Commit</Text>
                      <Text
                        variant="body-small"
                        style={{ overflowWrap: 'break-word' }}
                      >
                        {run.source.commit.hash!}
                      </Text>
                    </Flex>
                    <Tooltip>{run.message ?? 'No run message'}</Tooltip>
                  </TooltipTrigger>

                  {run.source.branchName && (
                    <Flex
                      direction="column"
                      style={{
                        marginTop: 'var(--bui-space-2)',
                        marginBottom: 'var(--bui-space-2)',
                      }}
                    >
                      <Text variant="body-small">Branch</Text>
                      <Text
                        variant="body-small"
                        style={{ overflowWrap: 'break-word' }}
                      >
                        {run.source.branchName}
                      </Text>
                    </Flex>
                  )}
                  <Flex
                    direction="column"
                    style={{
                      marginTop: 'var(--bui-space-2)',
                      marginBottom: 'var(--bui-space-2)',
                    }}
                  >
                    <Text variant="body-small">Workflow ID</Text>
                    <Text
                      variant="body-small"
                      style={{ overflowWrap: 'break-word' }}
                    >
                      {run.id}
                    </Text>
                  </Flex>
                  <Flex justify="center" align="center">
                    <WorkflowRunStatus
                      status={run.status}
                      conclusion={run.conclusion}
                    />
                  </Flex>
                  <Flex justify="center" align="center">
                    <TooltipTrigger>
                      <Text>{run.statusAge}</Text>
                      <Tooltip>{run.statusDate ?? ''}</Tooltip>
                    </TooltipTrigger>
                  </Flex>
                  <Flex
                    direction="column"
                    justify="between"
                    align="center"
                    style={{ marginTop: 'auto' }}
                  >
                    <div
                      style={{
                        marginTop: 'var(--bui-space-4)',
                        marginBottom: 'var(--bui-space-2)',
                      }}
                    >
                      <Button variant="secondary" onClick={run.onReRunClick}>
                        Rerun workflow <RiRestartLine size={16} />
                      </Button>
                    </div>

                    {run.githubUrl && (
                      <div>
                        <LinkButton
                          to={run.githubUrl}
                          endIcon={<RiExternalLinkLine size={14} />}
                        >
                          View on GitHub
                        </LinkButton>
                      </div>
                    )}
                  </Flex>
                </div>
              </Flex>
            </div>
          </Grid.Item>
        ))
      ) : (
        <Grid.Item colSpan={{ sm: '12' }}>
          <div style={{ padding: 'var(--bui-space-4)' }}>
            {loading ? <CircularProgress /> : 'No matching runs found.'}
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
              onChangePageSize(parseInt(event.target.value, 6))
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
      <div style={{ flexGrow: 1 }} />
      <TextField
        label="Search"
        value={searchTerm}
        onChange={setSearchTerm}
        data-testid="search-control"
        style={{ marginRight: '20px' }}
      />
      <ButtonGroup>
        <TooltipTrigger>
          <ButtonIcon
            aria-label="Reload workflow runs"
            onPress={retry}
            icon={<RiRefreshLine size={16} />}
            variant="secondary"
          />
          <Tooltip>Reload workflow runs</Tooltip>
        </TooltipTrigger>
      </ButtonGroup>
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

  const handleMenuChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const selectedValue = event.target.value as string;
    setBranch(selectedValue);
    setPage(0);
    retry();
  };

  useEffect(() => {
    setRuns(runsData);
  }, [runsData, branch]);

  useEffect(() => {
    setBranch(defaultBranch);
  }, [defaultBranch]);

  return (
    <div>
      <InfoCard
        title={
          <Flex align="center">
            <RiGithubLine size={20} />
            <div style={{ marginRight: 'var(--bui-space-2)' }} />
            <Text variant="title-small">{projectName}</Text>

            <Select
              value={branch}
              key={branch}
              label="Branch"
              onChange={handleMenuChange}
              data-testid="menu-control"
              style={{
                marginLeft: '30px',
                marginRight: '20px',
                width: '230px',
              }}
            >
              {branches.map(branchItem => (
                <MenuItem key={branchItem.name} value={branchItem.name}>
                  {branchItem.name === defaultBranch ? (
                    <Text variant="body-small" as="span">
                      {branchItem.name}{' '}
                      <Text
                        variant="body-x-small"
                        as="span"
                        style={{ color: 'lightgray' }}
                      >
                        (default)
                      </Text>
                    </Text>
                  ) : (
                    branchItem.name
                  )}
                </MenuItem>
              ))}

              <MenuItem
                value="all"
                key="all"
                style={{ color: 'lightGrey', fontSize: 'small' }}
              >
                select all branches
              </MenuItem>
            </Select>

            <WorkflowRunsCardSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              retry={retry}
            />
          </Flex>
        }
      >
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
      </InfoCard>
    </div>
  );
};

export default WorkflowRunsCard;
