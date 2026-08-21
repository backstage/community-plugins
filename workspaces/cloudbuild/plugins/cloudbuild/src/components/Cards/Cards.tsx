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

import {
  Link,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import { useEffect } from 'react';
import { getCloudbuildFilter } from '../useCloudBuildFilter';
import { getLocation } from '../useLocation';
import { CLOUDBUILD_ANNOTATION } from '../useProjectName';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunsTable } from '../WorkflowRunsTable';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import styles from './Cards.module.css';

const WidgetContent = ({
  error,
  loading,
  lastRun,
  branch,
}: {
  error?: Error;
  loading?: boolean;
  lastRun: WorkflowRun;
  branch: string;
}) => {
  if (error) {
    return <Text color="danger">Couldn't fetch latest {branch} run</Text>;
  }
  if (loading) return <Progress />;
  return (
    <StructuredMetadataTable
      metadata={{
        status: (
          <Flex>
            <WorkflowRunStatus status={lastRun.status} />
          </Flex>
        ),
        message: lastRun.message,
        url: (
          <Link to={lastRun.googleUrl ?? ''}>
            See more on Google{' '}
            <RiExternalLinkLine size={14} className={styles.externalLinkIcon} />
          </Link>
        ),
      }}
    />
  );
};

/** @public */
export const LatestWorkflowRunCard = (props: { branch: string }) => {
  const { branch = 'master' } = props;
  const { entity } = useEntity();
  const errorApi = useApi(errorApiRef);
  const projectId = entity.metadata.annotations?.[CLOUDBUILD_ANNOTATION] || '';
  const location = getLocation(entity);
  const cloudBuildFilter = getCloudbuildFilter(entity);

  const [{ runs, loading, error }] = useWorkflowRuns({
    projectId,
    location,
    cloudBuildFilter,
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
export const LatestWorkflowsForBranchCard = (props: { branch: string }) => {
  const { entity } = useEntity();
  return (
    <WorkflowRunsTable
      entity={entity}
      title={`Recent ${props.branch} builds`}
    />
  );
};
