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
import { ChangeEvent, useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import TablePagination from '@material-ui/core/TablePagination';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { LinkButton, Link, InfoCard } from '@backstage/core-components';
import GitHubIcon from '@material-ui/icons/GitHub';
import RetryIcon from '@material-ui/icons/Replay';
import SyncIcon from '@material-ui/icons/Sync';
import ExternalLinkIcon from '@material-ui/icons/Launch';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { buildRouteRef } from '../../routes';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { getHostnameFromEntity } from '../getHostnameFromEntity';

import Alert, { Color } from '@material-ui/lab/Alert';
import { Entity } from '@backstage/catalog-model';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[2],
      borderRadius: '4px',
      overflow: 'visible',
      position: 'relative',
      margin: theme.spacing(4, 1, 1),
      flex: '1',
      minWidth: '0px',
    },
    externalLinkIcon: {
      fontSize: 'inherit',
      verticalAlign: 'middle',
    },
    pagination: {
      width: '100%',
    },
  }),
);

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

const statusColors: Record<string, string> = {
  skipped: 'warning',
  canceled: 'info',
  timed_out: 'error',
  failure: 'error',
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
  const classes = useStyles();
  const routeLink = useRouteRef(buildRouteRef);

  const filteredRuns = runs?.filter(run => matchesSearchTerm(run, searchTerm));

  return (
    <Grid container spacing={3}>
      {filteredRuns && runs?.length !== 0 ? (
        filteredRuns.map(run => (
          <Grid key={run.id} item container xs={12} lg={6} xl={4}>
            <Box className={classes.card}>
              <Box
                display="flex"
                flexDirection="column"
                p={2}
                height="100%"
                alignItems="center"
              >
                <Box
                  sx={{ width: '100%' }}
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  height="100%"
                >
                  <Tooltip
                    title={run.status ?? 'No Status'}
                    placement="top-start"
                  >
                    <Alert
                      variant="outlined"
                      severity={
                        statusColors[
                          run.conclusion as keyof typeof statusColors
                        ] as Color
                      }
                      style={{ alignItems: 'center' }}
                    >
                      <Typography variant="h6">
                        <Link to={routeLink({ id: run.id })}>
                          <Typography variant="h6">
                            {run.workflowName}
                          </Typography>
                        </Link>
                      </Typography>
                    </Alert>
                  </Tooltip>
                  <Tooltip title={run.message ?? 'No run message'}>
                    <Box display="flex" flexDirection="column" marginY={1}>
                      <Typography variant="subtitle2" component="span">
                        Commit
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        style={{ overflowWrap: 'break-word' }}
                      >
                        {run.source.commit.hash!}
                      </Typography>
                    </Box>
                  </Tooltip>

                  {run.source.branchName && (
                    <Box display="flex" flexDirection="column" marginY={1}>
                      <Typography variant="subtitle2" component="span">
                        Branch
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        style={{ overflowWrap: 'break-word' }}
                      >
                        {run.source.branchName}
                      </Typography>
                    </Box>
                  )}
                  <Box display="flex" flexDirection="column" marginY={1}>
                    <Typography variant="subtitle2" component="span">
                      Workflow ID
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      style={{ overflowWrap: 'break-word' }}
                    >
                      {run.id}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <WorkflowRunStatus
                      status={run.status}
                      conclusion={run.conclusion}
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Tooltip title={run.statusDate ?? ''}>
                      <Box>{run.statusAge}</Box>
                    </Tooltip>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    alignItems="center"
                    mt="auto"
                  >
                    <Box marginTop={2} marginBottom={1}>
                      <Button
                        endIcon={<RetryIcon />}
                        onClick={run.onReRunClick}
                        variant="outlined"
                      >
                        Rerun workflow
                      </Button>
                    </Box>

                    {run.githubUrl && (
                      <Box>
                        <LinkButton
                          to={run.githubUrl}
                          endIcon={<ExternalLinkIcon />}
                        >
                          View on GitHub
                        </LinkButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))
      ) : (
        <Box p={2}>
          {loading ? <CircularProgress /> : 'No matching runs found.'}
        </Box>
      )}
      <div className={classes.pagination}>
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
    </Grid>
  );
};

type WorkflowRunsCardProps = {
  entity: Entity;
};

const WorkflowRunsCardSearch = ({
  searchTerm,
  handleSearch,
  retry,
}: {
  searchTerm: string;
  handleSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  retry: () => void;
}) => {
  return (
    <>
      <Box flexGrow={1} />
      <TextField
        type="search"
        label="Search"
        value={searchTerm}
        onChange={handleSearch}
        data-testid="search-control"
        style={{ marginRight: '20px' }}
      />
      <ButtonGroup>
        <Tooltip title="Reload workflow runs">
          <IconButton onClick={retry}>
            <SyncIcon />
          </IconButton>
        </Tooltip>
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

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
    event: ChangeEvent<{ name?: string; value: unknown }>,
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
    <Grid item>
      <InfoCard
        title={
          <Box display="flex" alignItems="center">
            <GitHubIcon />
            <Box mr={1} />
            <Typography variant="h6">{projectName}</Typography>

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
                    <Typography variant="body2" component="span">
                      {branchItem.name}{' '}
                      <Typography
                        variant="body2"
                        component="span"
                        style={{ color: 'lightgray', fontSize: 'x-small' }}
                      >
                        (default)
                      </Typography>
                    </Typography>
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
              handleSearch={handleSearch}
              retry={retry}
            />
          </Box>
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
    </Grid>
  );
};

export default WorkflowRunsCard;
