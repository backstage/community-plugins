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
  Breadcrumbs,
  Link,
  Progress,
  StructuredMetadataTable,
} from '@backstage/core-components';
import {
  Alert,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Text,
} from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import qs from 'qs';
import { getLocation } from '../useLocation';
import { useProjectName } from '../useProjectName';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import styles from './WorkflowRunDetails.module.css';
import { useWorkflowRunsDetails } from './useWorkflowRunsDetails';

export const WorkflowRunDetails = (props: { entity: Entity }) => {
  const { value: projectName, loading, error } = useProjectName(props.entity);
  const [projectId] = (projectName ?? '/').split('/');
  const location = getLocation(props.entity);
  const details = useWorkflowRunsDetails(projectId, location);

  if (error) {
    return (
      <Alert status="danger" title="Failed to load build">
        {error.message}
      </Alert>
    );
  }
  if (loading || details.value?.logUrl === undefined) {
    return <Progress />;
  }

  const serviceAccount = qs.parse(new URL(details.value.logUrl).search, {
    ignoreQueryPrefix: true,
  }).project;

  return (
    <Box className={styles.root}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="..">Build history</Link>
          <Text>Build details</Text>
        </Breadcrumbs>
      </div>
      <Card>
        <CardHeader>
          <Text variant="title-medium">Build details</Text>
        </CardHeader>
        <CardBody>
          <StructuredMetadataTable
            metadata={{
              ref: details.value.substitutions.REF_NAME,
              message: details.value.substitutions.REPO_NAME,
              'commit id': details.value.substitutions.COMMIT_SHA,
              status: (
                <Flex>
                  <WorkflowRunStatus status={details.value.status} />
                </Flex>
              ),
              'service account': `${serviceAccount}@cloudbuild.gserviceaccount.com`,
              links: (
                <Link to={details.value.logUrl}>
                  Workflow runs on Google{' '}
                  <RiExternalLinkLine
                    size={14}
                    className={styles.externalLinkIcon}
                  />
                </Link>
              ),
            }}
          />
        </CardBody>
      </Card>
    </Box>
  );
};
