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

import { Entity } from '@backstage/catalog-model';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExternalLinkIcon from '@material-ui/icons/Launch';
import { DateTime } from 'luxon';
import React from 'react';
import { Job, Jobs, Step } from '../../api';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { useWorkflowRunJobs } from './useWorkflowRunJobs';
import { useWorkflowRunsDetails } from './useWorkflowRunsDetails';
import { WorkflowRunLogs } from '../WorkflowRunLogs';
import { Breadcrumbs, Link } from '@backstage/core-components';
import { getHostnameFromEntity } from '../getHostnameFromEntity';

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    maxWidth: 720,
    margin: theme.spacing(2),
  },
  title: {
    padding: theme.spacing(1, 0, 2, 0),
  },
  table: {
    padding: theme.spacing(1),
  },
  accordionDetails: {
    padding: 0,
  },
  button: {
    order: -1,
    marginRight: 0,
    marginLeft: '-20px',
  },
  externalLinkIcon: {
    fontSize: 'inherit',
    verticalAlign: 'bottom',
  },
}));

const getElapsedTime = (start: string | undefined, end: string | undefined) => {
  if (!start || !end) {
    return '';
  }
  const startDate = DateTime.fromISO(start);
  const endDate = end ? DateTime.fromISO(end) : DateTime.now();
  const diff = endDate.diff(startDate);
  const timeElapsed = diff.toFormat(`m 'minutes' s 'seconds'`);
  return timeElapsed;
};

const StepView = ({ step }: { step: Step }) => {
  return (
    <TableRow>
      <TableCell>
        <ListItemText
          primary={step.name}
          secondary={getElapsedTime(step.started_at, step.completed_at)}
        />
      </TableCell>
      <TableCell>
        <WorkflowRunStatus
          status={step.status.toLocaleUpperCase('en-US')}
          conclusion={step.conclusion?.toLocaleUpperCase('en-US')}
        />
      </TableCell>
    </TableRow>
  );
};

const JobListItem = ({
  job,
  className,
  entity,
}: {
  job: Job;
  className: string;
  entity: Entity;
}) => {
  const classes = useStyles();
  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} className={className}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        IconButtonProps={{
          className: classes.button,
        }}
      >
        <Typography variant="button">
          {job.name} ({getElapsedTime(job.started_at, job.completed_at)})
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>
        <TableContainer>
          <Table>
            {job.steps?.map(step => (
              <StepView key={step.number} step={step} />
            ))}
          </Table>
        </TableContainer>
      </AccordionDetails>
      {job.status === 'queued' || job.status === 'in_progress' ? (
        <WorkflowRunLogs runId={job.id} inProgress entity={entity} />
      ) : (
        <WorkflowRunLogs runId={job.id} inProgress={false} entity={entity} />
      )}
    </Accordion>
  );
};

const JobsList = ({ jobs, entity }: { jobs?: Jobs; entity: Entity }) => {
  const classes = useStyles();
  return (
    <Box>
      {jobs &&
        jobs.total_count > 0 &&
        jobs.jobs.map(job => (
          <JobListItem
            key={job.id}
            job={job}
            className={
              job.status !== 'success' ? classes.failed : classes.success
            }
            entity={entity}
          />
        ))}
    </Box>
  );
};

export const WorkflowRunDetails = ({ entity }: { entity: Entity }) => {
  const projectName = getProjectNameFromEntity(entity);

  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (projectName && projectName.split('/')) || [];
  const details = useWorkflowRunsDetails({ hostname, owner, repo });
  const jobs = useWorkflowRunJobs({ hostname, owner, repo });

  const classes = useStyles();

  if (details.error && details.error.message) {
    return (
      <Typography variant="h6" color="error">
        Failed to load build, {details.error.message}
      </Typography>
    );
  } else if (details.loading) {
    return <LinearProgress />;
  }
  return (
    <div className={classes.root}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="..">Workflow runs</Link>
          <Typography>Workflow run details</Typography>
        </Breadcrumbs>
      </Box>
      <TableContainer component={Paper} className={classes.table}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography noWrap>Branch</Typography>
              </TableCell>
              <TableCell>{details.value?.head_branch}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Message</Typography>
              </TableCell>
              <TableCell>{details.value?.head_commit?.message}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Commit ID</Typography>
              </TableCell>
              <TableCell>{details.value?.head_commit?.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Workflow</Typography>
              </TableCell>
              <TableCell>{details.value?.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Status</Typography>
              </TableCell>
              <TableCell>
                <WorkflowRunStatus
                  status={details.value?.status || undefined}
                  conclusion={details.value?.conclusion || undefined}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Author</Typography>
              </TableCell>
              <TableCell>{`${details.value?.head_commit?.author?.name} (${details.value?.head_commit?.author?.email})`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography noWrap>Links</Typography>
              </TableCell>
              <TableCell>
                {details.value?.html_url && (
                  <Link to={details.value.html_url}>
                    Workflow runs on GitHub{' '}
                    <ExternalLinkIcon className={classes.externalLinkIcon} />
                  </Link>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography noWrap>Jobs</Typography>
                {jobs.loading ? (
                  <CircularProgress />
                ) : (
                  <JobsList jobs={jobs.value} entity={entity} />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
