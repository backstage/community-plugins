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
import { useApi } from '@backstage/core-plugin-api';
import { Box, Flex, Text } from '@backstage/ui';

import { quayApiRef } from '../../api';
import { DOC_LINKS } from '../../doc-links';
import { useRepository, useTags } from '../../hooks';
import { useQuayViewPermission } from '../../hooks/useQuayViewPermission';
import PermissionAlert from '../PermissionAlert/PermissionAlert';
import styles from './QuayRepository.module.css';
import { columns } from './tableHeading';

type QuayRepositoryProps = Record<never, any>;

export function QuayRepository(_props: QuayRepositoryProps) {
  const { instanceName, repository, organization } = useRepository();
  const quayApi = useApi(quayApiRef);

  const instanceConfig = quayApi.getQuayInstance(instanceName);
  const quayUiUrl = instanceConfig?.apiUrl ?? instanceConfig?.uiUrl;

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
  const { loading, data } = useTags(instanceName, organization, repository);

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
          <Box
            data-testid="quay-repo-table-empty"
            p="4"
            className={styles.emptyState}
          >
            <Flex direction="column" align="center" gap="2">
              <Text variant="title-small">No container images found</Text>
              <Text variant="body-medium" color="secondary">
                This repository doesn't contain any images yet, or there might
                be an access issue.
              </Text>
            </Flex>
            <Flex
              direction="column"
              align="center"
              gap="2"
              className={styles.emptyStateSection}
            >
              <Text variant="body-small" weight="bold">
                Possible solutions:
              </Text>
              <Text variant="body-small">
                1. Check if images have been pushed to this repository
              </Text>
              <Text variant="body-small">
                2. Review the application logs in your Backstage instance
              </Text>
              <Text variant="body-small">
                3. Verify your entity annotations are{' '}
                <Link to={DOC_LINKS.BACKEND_ANNOTATIONS_GUIDE}>
                  configured correctly
                </Link>
              </Text>
              <Text variant="body-small">
                4. Verify your{' '}
                <Link to={DOC_LINKS.AUTH_TOKEN_GUIDE}>Quay access tokens</Link>{' '}
                are{' '}
                <Link to={DOC_LINKS.BACKEND_CONFIGURATION_GUIDE}>
                  configured correctly
                </Link>
              </Text>
            </Flex>
          </Box>
        }
      />
    </div>
  );
}
