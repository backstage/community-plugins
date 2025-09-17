/*
 * Copyright 2024 The Backstage Authors
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
import { Link, Progress, Table } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { Box, Typography } from '@material-ui/core';

import { DOC_LINKS } from '../../doc-links';
import { useRepository, useTags } from '../../hooks';
import { useQuayViewPermission } from '../../hooks/useQuayViewPermission';
import PermissionAlert from '../PermissionAlert/PermissionAlert';
import { columns } from './tableHeading';

type QuayRepositoryProps = Record<never, any>;

export function QuayRepository(_props: QuayRepositoryProps) {
  const { repository, organization } = useRepository();
  const configApi = useApi(configApiRef);
  const quayUiUrl =
    configApi.getOptionalString('quay.apiUrl') ??
    configApi.getOptionalString('quay.uiUrl');

  const hasViewPermission = useQuayViewPermission();

  const title = quayUiUrl ? (
    <>
      {`Quay repository: `}
      <Link
        to={`${quayUiUrl}/repository/${organization}/${repository}`}
      >{`${organization}/${repository}`}</Link>
    </>
  ) : (
    `Quay repository: ${organization}/${repository}`
  );
  const { loading, data } = useTags(organization, repository);

  if (!hasViewPermission) {
    return <PermissionAlert />;
  }

  if (loading) {
    return (
      <div data-testid="quay-repo-progress">
        <Progress />
      </div>
    );
  }

  return (
    <div data-testid="quay-repo-table">
      <Table
        title={title}
        options={{ sorting: true, paging: true, padding: 'dense' }}
        data={data}
        columns={columns}
        emptyContent={
          <Box data-testid="quay-repo-table-empty" padding={2}>
            <Typography component="h3" align="center" variant="h6" gutterBottom>
              No container images found
            </Typography>
            <Typography
              component="p"
              align="center"
              variant="body1"
              color="textSecondary"
              gutterBottom
            >
              This repository doesn't contain any images yet, or there might be
              an access issue.
            </Typography>
            <Box mt={2}>
              <Typography
                component="p"
                align="center"
                variant="body2"
                gutterBottom
              >
                <strong>Possible solutions:</strong>
              </Typography>
              <Typography
                component="p"
                align="center"
                variant="body2"
                gutterBottom
              >
                1. Check if images have been pushed to this repository
              </Typography>
              <Typography
                component="p"
                align="center"
                variant="body2"
                gutterBottom
              >
                2. Review the application logs in your Backstage instance
              </Typography>
              <Typography component="p" align="center" variant="body2">
                3. Verify your{' '}
                <Link to={DOC_LINKS.AUTH_TOKEN_GUIDE}>Quay access tokens</Link>{' '}
                are{' '}
                <Link to={DOC_LINKS.BACKEND_CONFIGURATION_GUIDE}>
                  configured correctly
                </Link>
              </Typography>
            </Box>
          </Box>
        }
      />
    </div>
  );
}
