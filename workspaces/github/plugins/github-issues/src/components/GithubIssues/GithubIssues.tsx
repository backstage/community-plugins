/*
 * Copyright 2022 The Backstage Authors
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
  Text,
  Flex,
  Box,
  ButtonIcon,
  Card,
  CardHeader,
  CardBody,
} from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';
import { Progress } from '@backstage/core-components';
import { useEntityGithubRepositories } from '../../hooks/useEntityGithubRepositories';
import { useGetIssuesByRepoFromGithub } from '../../hooks/useGetIssuesByRepoFromGithub';
import { IssuesList } from './IssuesList';
import { NoRepositoriesInfo } from './NoRepositoriesInfo';
import type {
  GithubIssuesFilters,
  GithubIssuesOrdering,
} from '../../api/githubIssuesApi';
import styles from './GithubIssues.module.css';

/**
 * @public
 */
export type GithubIssuesProps = {
  itemsPerPage?: number;
  itemsPerRepo?: number;
  filterBy?: GithubIssuesFilters;
  orderBy?: GithubIssuesOrdering;
};

export const GithubIssues = (props: GithubIssuesProps) => {
  const { itemsPerPage = 10, itemsPerRepo = 40, filterBy, orderBy } = props;

  const { repositories } = useEntityGithubRepositories();
  const {
    isLoading,
    githubIssuesByRepo: issuesByRepository,
    retry,
  } = useGetIssuesByRepoFromGithub(repositories, itemsPerRepo, {
    filterBy,
    orderBy,
  });

  if (!repositories.length) {
    return <NoRepositoriesInfo />;
  }

  return (
    <Card>
      <CardHeader className={styles.cardHeader}>
        <Flex justify="between" align="center">
          <Text variant="title-medium">Open GitHub Issues</Text>
          <Box>
            <ButtonIcon
              aria-label="Refresh"
              onPress={retry}
              icon={<RiRefreshLine size={20} />}
              variant="secondary"
            />
          </Box>
        </Flex>
      </CardHeader>
      <CardBody className={styles.cardBody}>
        {isLoading && <Progress />}

        <IssuesList
          issuesByRepository={issuesByRepository}
          itemsPerPage={itemsPerPage}
        />
      </CardBody>
    </Card>
  );
};
