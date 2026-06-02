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
import { Box, Card, Skeleton, Text } from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';
import qs from 'qs';
import { useProjectName } from '../useProjectName';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { useWorkflowRunsDetails } from './useWorkflowRunsDetails';
import { Breadcrumbs, Link, WarningPanel } from '@backstage/core-components';
import { getLocation } from '../useLocation';
import styles from './WorkflowRunDetails.module.css';

export const WorkflowRunDetails = (props: { entity: Entity }) => {
  const { value: projectName, loading, error } = useProjectName(props.entity);
  const [projectId] = (projectName ?? '/').split('/');
  const location = getLocation(props.entity);

  const details = useWorkflowRunsDetails(projectId, location);

  if (error) {
    return (
      <WarningPanel title="Error:">
        Failed to load build, {error.message}.
      </WarningPanel>
    );
  } else if (loading) {
    return <Skeleton />;
  } else if (details.value?.logUrl === undefined) {
    return <Skeleton />;
  }

  const serviceAccount = qs.parse(new URL(details.value?.logUrl).search, {
    ignoreQueryPrefix: true,
  }).project;

  return (
    <Box className={styles.root}>
      <Box className={styles.breadcrumbs}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="..">Build history</Link>
          <Text>Build details</Text>
        </Breadcrumbs>
      </Box>
      <Card>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th scope="row" className={styles.label}>
                <Text>Ref</Text>
              </th>
              <td>{details.value?.substitutions.REF_NAME}</td>
            </tr>
            <tr>
              <th scope="row" className={styles.label}>
                <Text>Message</Text>
              </th>
              <td>{details.value?.substitutions.REPO_NAME}</td>
            </tr>
            <tr>
              <th scope="row" className={styles.label}>
                <Text>Commit ID</Text>
              </th>
              <td>{details.value?.substitutions.COMMIT_SHA}</td>
            </tr>
            <tr>
              <th scope="row" className={styles.label}>
                <Text>Status</Text>
              </th>
              <td>
                <WorkflowRunStatus status={details.value?.status} />
              </td>
            </tr>
            <tr>
              <th scope="row" className={styles.label}>
                <Text>Service Account</Text>
              </th>
              <td>{`${serviceAccount}`}@cloudbuild.gserviceaccount.com</td>
            </tr>
            <tr>
              <th scope="row" className={styles.label}>
                <Text>Links</Text>
              </th>
              <td>
                {details.value?.logUrl && (
                  <Link to={details.value.logUrl}>
                    Workflow runs on Google{' '}
                    <RiExternalLinkLine
                      aria-hidden="true"
                      className={styles.externalLinkIcon}
                    />
                  </Link>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </Box>
  );
};
