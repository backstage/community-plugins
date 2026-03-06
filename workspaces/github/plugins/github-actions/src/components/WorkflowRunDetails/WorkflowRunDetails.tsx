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
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import {
  Tooltip,
  Text,
  TooltipTrigger,
  Accordion,
  AccordionTrigger,
  AccordionPanel,
} from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import { DateTime } from 'luxon';
import { Job, Jobs, Step } from '../../api';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { useWorkflowRunJobs } from './useWorkflowRunJobs';
import { useWorkflowRunsDetails } from './useWorkflowRunsDetails';
import { WorkflowRunLogs } from '../WorkflowRunLogs';
import { Breadcrumbs, Link } from '@backstage/core-components';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import styles from './WorkflowRunDetails.module.css';

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
  return (
    <Accordion className={className}>
      <AccordionTrigger
        title={`${job.name} (${getElapsedTime(
          job.started_at,
          job.completed_at,
        )})`}
      />
      <AccordionPanel className={styles.accordionDetails}>
        <TableContainer>
          <Table>
            {job.steps?.map(step => (
              <StepView key={step.number} step={step} />
            ))}
          </Table>
        </TableContainer>
        {job.status === 'queued' || job.status === 'in_progress' ? (
          <WorkflowRunLogs runId={job.id} inProgress entity={entity} />
        ) : (
          <WorkflowRunLogs runId={job.id} inProgress={false} entity={entity} />
        )}
      </AccordionPanel>
    </Accordion>
  );
};

const JobsList = ({ jobs, entity }: { jobs?: Jobs; entity: Entity }) => {
  return (
    <div>
      {jobs &&
        jobs.total_count > 0 &&
        jobs.jobs.map(job => (
          <JobListItem
            key={job.id}
            job={job}
            className={
              job.status !== 'success' ? styles.failed : styles.success
            }
            entity={entity}
          />
        ))}
    </div>
  );
};

export const WorkflowRunDetails = ({ entity }: { entity: Entity }) => {
  const projectName = getProjectNameFromEntity(entity);

  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (projectName && projectName.split('/')) || [];
  const details = useWorkflowRunsDetails({ hostname, owner, repo });
  const jobs = useWorkflowRunJobs({ hostname, owner, repo });

  if (details.error && details.error.message) {
    return (
      <Text variant="title-small" color="danger">
        Failed to load build, {details.error.message}
      </Text>
    );
  } else if (details.loading) {
    return <LinearProgress />;
  }
  return (
    <div className={styles.root}>
      <div style={{ marginBottom: 'var(--bui-space-6)' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="..">Workflow runs</Link>
          <Text>Workflow run details</Text>
        </Breadcrumbs>
      </div>
      <TableContainer component={Paper} className={styles.table}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Text>Branch</Text>
              </TableCell>
              <TableCell>{details.value?.head_branch}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Text>Message</Text>
              </TableCell>
              <TableCell>{details.value?.head_commit?.message}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Text>Commit ID</Text>
              </TableCell>
              <TableCell>{details.value?.head_commit?.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Text>Workflow</Text>
              </TableCell>
              <TableCell>{details.value?.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Text>Status</Text>
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
                <Text>Age</Text>
              </TableCell>
              <TableCell>
                <TooltipTrigger>
                  <Text>{`${(details.value?.updated_at
                    ? DateTime.fromISO(details.value?.updated_at)
                    : DateTime.now()
                  ).toRelative()}`}</Text>
                  <Tooltip>{details.value?.updated_at ?? ''}</Tooltip>
                </TooltipTrigger>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Text>Author</Text>
              </TableCell>
              <TableCell>{`${details.value?.head_commit?.author?.name} (${details.value?.head_commit?.author?.email})`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Text>Links</Text>
              </TableCell>
              <TableCell>
                {details.value?.html_url && (
                  <Link to={details.value.html_url}>
                    Workflow runs on GitHub{' '}
                    <RiExternalLinkLine
                      size={14}
                      className={styles.externalLinkIcon}
                    />
                  </Link>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <Text>Jobs</Text>
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
