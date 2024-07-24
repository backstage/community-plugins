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
import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { GITHUB_ACTIONS_ANNOTATION } from '../getProjectNameFromEntity';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import Typography from '@material-ui/core/Typography';

import { errorApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  ErrorPanel,
  InfoCard,
  InfoCardVariants,
  Link,
  Table,
} from '@backstage/core-components';
import { buildRouteRef } from '../../routes';
import { getHostnameFromEntity } from '../getHostnameFromEntity';

const firstLine = (message: string): string => message.split('\n')[0];

/** @public */
export const RecentWorkflowRunsCard = (props: {
  branch?: string;
  dense?: boolean;
  limit?: number;
  variant?: InfoCardVariants;
}) => {
  const { branch, dense = false, limit = 5, variant } = props;

  const { entity } = useEntity();
  const errorApi = useApi(errorApiRef);

  const hostname = getHostnameFromEntity(entity);

  const [owner, repo] = (
    entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '/'
  ).split('/');

  const [{ runs = [], loading, error }] = useWorkflowRuns({
    hostname,
    owner,
    repo,
    branch,
    initialPageSize: limit,
  });

  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);

  const githubHost = hostname || 'github.com';
  const routeLink = useRouteRef(buildRouteRef);

  if (error) {
    return <ErrorPanel title={error.message} error={error} />;
  }

  return (
    <InfoCard
      title="Recent Workflow Runs"
      subheader={branch ? `Branch: ${branch}` : 'All Branches'}
      noPadding
      variant={variant}
    >
      {!runs.length ? (
        <div style={{ textAlign: 'center' }}>
          <Typography variant="body1">
            This component has GitHub Actions enabled, but no workflows were
            found.
          </Typography>
          <Typography variant="body2">
            <Link to={`https://${githubHost}/${owner}/${repo}/actions/new`}>
              Create a new workflow
            </Link>
          </Typography>
        </div>
      ) : (
        <Table<WorkflowRun>
          isLoading={loading}
          options={{
            search: false,
            paging: false,
            padding: dense ? 'dense' : 'default',
            toolbar: false,
          }}
          columns={[
            {
              title: 'Commit Message',
              field: 'message',
              render: data => (
                <Link component={RouterLink} to={routeLink({ id: data.id! })}>
                  {firstLine(data.message ?? '')}
                </Link>
              ),
            },
            { title: 'Branch', field: 'source.branchName' },
            { title: 'Status', field: 'status', render: WorkflowRunStatus },
          ]}
          data={runs}
        />
      )}
    </InfoCard>
  );
};
