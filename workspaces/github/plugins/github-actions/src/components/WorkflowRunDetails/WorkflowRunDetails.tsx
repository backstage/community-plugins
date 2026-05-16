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
import {
  Tooltip,
  Text,
  TooltipTrigger,
  Accordion,
  AccordionTrigger,
  AccordionPanel,
  Box,
  Flex,
  Card,
  CardHeader,
  CardBody,
} from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import { DateTime } from 'luxon';
import { Job, Jobs } from '../../api';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { useWorkflowRunJobs } from './useWorkflowRunJobs';
import { useWorkflowRunsDetails } from './useWorkflowRunsDetails';
import { WorkflowRunLogs } from '../WorkflowRunLogs';
import {
  Breadcrumbs,
  Link,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
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

const JobListItem = ({
  job,
  className,
  entity,
}: {
  job: Job;
  className: string;
  entity: Entity;
}) => {
  const stepsMetadata = job.steps?.reduce((acc, step) => {
    acc[step.name] = (
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center">
          <Text variant="body-small" color="secondary">
            {getElapsedTime(step.started_at, step.completed_at)}
          </Text>
          <WorkflowRunStatus
            status={step.status.toLocaleUpperCase('en-US')}
            conclusion={step.conclusion?.toLocaleUpperCase('en-US')}
          />
        </Flex>
      </Flex>
    );
    return acc;
  }, {} as Record<string, React.ReactNode>);

  return (
    <Accordion className={`${className} ${styles.jobListItem}`}>
      <AccordionTrigger
        title={`${job.name} (${getElapsedTime(
          job.started_at,
          job.completed_at,
        )})`}
      />
      <AccordionPanel className={styles.accordionDetails}>
        {job.steps && job.steps.length > 0 && (
          <div className={styles.stepsMetadata}>
            <StructuredMetadataTable metadata={stepsMetadata || {}} />
          </div>
        )}
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
    <Box mt="2">
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
    </Box>
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
    return <Progress />;
  }
  return (
    <div className={styles.root}>
      <div style={{ marginBottom: 'var(--bui-space-6)' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="..">Workflow runs</Link>
          <Text>Workflow run details</Text>
        </Breadcrumbs>
      </div>
      <Card>
        <CardHeader>
          <Text variant="title-medium">Workflow Run Details</Text>
        </CardHeader>
        <CardBody>
          <StructuredMetadataTable
            metadata={{
              branch: details.value?.head_branch,
              message: details.value?.head_commit?.message,
              'commit id': details.value?.head_commit?.id,
              workflow: details.value?.name,
              status: (
                <Flex>
                  <WorkflowRunStatus
                    status={details.value?.status || undefined}
                    conclusion={details.value?.conclusion || undefined}
                  />
                </Flex>
              ),
              age: (
                <TooltipTrigger>
                  <Text>{`${(details.value?.updated_at
                    ? DateTime.fromISO(details.value?.updated_at)
                    : DateTime.now()
                  ).toRelative()}`}</Text>
                  <Tooltip>{details.value?.updated_at ?? ''}</Tooltip>
                </TooltipTrigger>
              ),
              author: `${details.value?.head_commit?.author?.name} (${details.value?.head_commit?.author?.email})`,
              links: details.value?.html_url && (
                <Link to={details.value.html_url}>
                  Workflow runs on GitHub{' '}
                  <RiExternalLinkLine
                    size={14}
                    className={styles.externalLinkIcon}
                  />
                </Link>
              ),
            }}
          />
          <div style={{ marginTop: 'var(--bui-space-2)' }}>
            <Text variant="title-medium">Jobs</Text>
            {jobs.loading ? (
              <Progress />
            ) : (
              <JobsList jobs={jobs.value} entity={entity} />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
