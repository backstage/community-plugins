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
import {
  Tooltip,
  Text,
  Flex,
  TooltipTrigger,
  Card,
  CardHeader,
  CardBody,
} from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import { useEffect } from 'react';
import { GITHUB_ACTIONS_ANNOTATION } from '../getProjectNameFromEntity';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunsTable } from '../WorkflowRunsTable';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Link,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import { useDefaultBranch } from '../useDefaultBranch';
import styles from './Cards.module.css';

const WidgetContent = (props: {
  error?: Error;
  loading?: boolean;
  lastRun: WorkflowRun;
  branch?: string;
}) => {
  const { error, loading, lastRun, branch } = props;

  if (error) return <Text>Couldn't fetch latest {branch} run</Text>;
  if (loading) return <Progress />;

  return (
    <StructuredMetadataTable
      metadata={{
        status: (
          <Flex>
            <WorkflowRunStatus
              status={lastRun.status}
              conclusion={lastRun.conclusion}
            />
          </Flex>
        ),
        age: (
          <Flex>
            <TooltipTrigger>
              <Text>{lastRun.statusAge}</Text>
              <Tooltip>{lastRun.statusDate ?? ''}</Tooltip>
            </TooltipTrigger>
          </Flex>
        ),
        message: lastRun.message,
        url: (
          <Link to={lastRun.githubUrl ?? ''}>
            See more on GitHub{' '}
            <RiExternalLinkLine size={14} className={styles.externalLinkIcon} />
          </Link>
        ),
      }}
    />
  );
};

/** @public */
export const LatestWorkflowRunCard = (props: { branch?: string }) => {
  const { entity } = useEntity();
  const errorApi = useApi(errorApiRef);
  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (
    entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '/'
  ).split('/');
  const defaultBranch = useDefaultBranch({
    hostname,
    owner,
    repo,
  }).branch;
  const branch = props.branch ?? defaultBranch;
  const [{ runs, loading, error }] = useWorkflowRuns({
    hostname,
    owner,
    repo,
    branch,
    fetchAllBranches: false,
  });
  const lastRun = runs?.[0] ?? ({} as WorkflowRun);
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  return (
    <Card>
      <CardHeader>
        <Text variant="title-medium">Last {branch} build</Text>
      </CardHeader>
      <CardBody>
        <WidgetContent
          error={error}
          loading={loading}
          branch={branch}
          lastRun={lastRun}
        />
      </CardBody>
    </Card>
  );
};

/** @public */
export const LatestWorkflowsForBranchCard = (props: { branch?: string }) => {
  const { entity } = useEntity();
  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (
    entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '/'
  ).split('/');
  const defaultBranch = useDefaultBranch({
    hostname,
    owner,
    repo,
  }).branch;
  const branch = props.branch ?? defaultBranch;
  const title = `Recent ${branch} builds`;

  return <WorkflowRunsTable branch={branch} entity={entity} title={title} />;
};
