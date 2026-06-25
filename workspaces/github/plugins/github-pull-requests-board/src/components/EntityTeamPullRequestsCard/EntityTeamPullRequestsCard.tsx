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
import { useState } from 'react';
import { Grid, Text, Flex, Card, CardHeader, CardBody } from '@backstage/ui';
import {
  RiFullscreenLine,
  RiGroupLine,
  RiInboxUnarchiveLine,
} from '@remixicon/react';

import { Progress } from '@backstage/core-components';

import { InfoCardHeader } from '../InfoCardHeader';
import { PullRequestBoardOptions } from '../PullRequestBoardOptions';
import { Wrapper } from '../Wrapper';
import { PullRequestCard } from '../PullRequestCard';
import { usePullRequestsByTeam } from '../../hooks/usePullRequestsByTeam';
import { PRCardFormating } from '../../utils/types';
import { shouldDisplayCard } from '../../utils/functions';
import { DraftPrIcon } from '../icons/DraftPr';
import { useUserRepositoriesAndTeam } from '../../hooks/useUserRepositoriesAndTeam';
import { useEntity } from '@backstage/plugin-catalog-react';

/** @public */
export interface EntityTeamPullRequestsCardProps {
  pullRequestLimit?: number;
}

const EntityTeamPullRequestsCard = (props: EntityTeamPullRequestsCardProps) => {
  const { pullRequestLimit } = props;
  const [infoCardFormat, setInfoCardFormat] = useState<PRCardFormating[]>([]);
  const { entity: teamEntity } = useEntity();
  const {
    loading: loadingReposAndTeam,
    repositories,
    teamMembers,
    teamMembersOrganization,
  } = useUserRepositoriesAndTeam(teamEntity);
  const {
    loading: loadingPRs,
    pullRequests,
    refreshPullRequests,
  } = usePullRequestsByTeam(
    repositories,
    teamMembers,
    teamMembersOrganization,
    pullRequestLimit,
  );

  const header = (
    <InfoCardHeader onRefresh={refreshPullRequests}>
      <PullRequestBoardOptions
        onClickOption={newFormats => setInfoCardFormat(newFormats)}
        value={infoCardFormat}
        options={[
          {
            icon: <RiGroupLine size={20} />,
            value: 'team',
            ariaLabel: 'Show PRs from your team',
          },
          {
            icon: <DraftPrIcon />,
            value: 'draft',
            ariaLabel: 'Show draft PRs',
          },
          {
            icon: <RiInboxUnarchiveLine size={20} />,
            value: 'archivedRepo',
            ariaLabel: 'Show archived repos',
          },
          {
            icon: <RiFullscreenLine size={20} />,
            value: 'fullscreen',
            ariaLabel: 'Set card to fullscreen',
          },
        ]}
      />
    </InfoCardHeader>
  );

  const getContent = () => {
    if (loadingReposAndTeam || loadingPRs) {
      return <Progress />;
    }

    return (
      <Grid.Root columns="auto" gap="4">
        {pullRequests.length ? (
          pullRequests.map(({ title: columnTitle, content }) => (
            <Wrapper
              key={columnTitle}
              fullscreen={infoCardFormat.includes('fullscreen')}
            >
              <Flex direction="column" gap="3">
                <Text
                  variant="body-small"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {columnTitle}
                </Text>
                {content.map(
                  (
                    {
                      id,
                      title,
                      createdAt,
                      lastEditedAt,
                      author,
                      url,
                      latestReviews,
                      repository,
                      isDraft,
                      labels,
                      commits,
                    },
                    index,
                  ) =>
                    shouldDisplayCard(
                      repository,
                      author,
                      repositories,
                      teamMembers,
                      infoCardFormat,
                      isDraft,
                    ) && (
                      <PullRequestCard
                        key={`pull-request-${id}-${index}`}
                        title={title}
                        createdAt={createdAt}
                        updatedAt={lastEditedAt}
                        author={author}
                        url={url}
                        reviews={latestReviews.nodes}
                        repositoryName={repository.name}
                        repositoryIsArchived={repository.isArchived}
                        isDraft={isDraft}
                        labels={labels.nodes}
                        status={commits.nodes}
                      />
                    ),
                )}
              </Flex>
            </Wrapper>
          ))
        ) : (
          <Grid.Item colSpan={{ sm: '12' }}>
            <Text variant="body-small" data-testid="no-prs-msg">
              No pull requests found
            </Text>
          </Grid.Item>
        )}
      </Grid.Root>
    );
  };

  return (
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardBody>{getContent()}</CardBody>
    </Card>
  );
};

export default EntityTeamPullRequestsCard;
