/*
 * Copyright 2021 The Backstage Authors
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

import { Grid, Card, CardBody, Text } from '@backstage/ui';
import { parseEntityRef } from '@backstage/catalog-model';
import { Avatar, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { AboutField } from './AboutField';
import { StatusTag } from '../StatusTag';
import { Member, BazaarProject } from '../../types';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import styles from './CardContentFields.module.css';

type Props = {
  bazaarProject: BazaarProject;
  members: Member[];
  descriptionSize: number;
  membersSize: number;
  isMember: boolean;
};

export const CardContentFields = ({
  bazaarProject,
  members,
  descriptionSize,
  membersSize,
  isMember,
}: Props) => {
  const catalogEntityRoute = useRouteRef(entityRouteRef);
  const currentPage = window.location.pathname;
  const isEntityPage = currentPage.includes('/catalog/');
  return (
    <div>
      <Card>
        <CardBody>
          <Grid.Root columns={{ sm: '12' }}>
            <Grid.Item colSpan={{ sm: String(descriptionSize) as any }}>
              <AboutField label="Description">
                {bazaarProject.description
                  .split('\n')
                  .map((str: string, i: number) => (
                    <Text key={i} variant="body-small">
                      {str}
                    </Text>
                  ))}
              </AboutField>
            </Grid.Item>

            <Grid.Item
              colSpan={{ sm: String(membersSize) as any }}
              className={styles.membersJustifyEnd}
            >
              <AboutField label="Latest members">
                {members.length ? (
                  members.slice(0, 7).map((member: Member) => {
                    return (
                      <div
                        style={{
                          textAlign: 'left',
                          marginBottom: '0.3rem',
                          marginTop: '0.3rem',
                          display: 'block',
                        }}
                        key={member.userId}
                      >
                        <Avatar
                          displayName={member.userId}
                          classes={{
                            avatar: styles.avatar,
                            avatarText: styles.avatarText,
                          }}
                          picture={member.picture}
                        />
                        <Link
                          target="_blank"
                          to={
                            member.userRef
                              ? `${catalogEntityRoute(
                                  parseEntityRef(member.userRef),
                                )}`
                              : `http://github.com/${member.userId}`
                          }
                        >
                          {member?.userId}
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div />
                )}
              </AboutField>
            </Grid.Item>

            {!isEntityPage && isMember && (
              <Grid.Item colSpan={{ sm: '12' }}>
                <AboutField label="I've joined the project, what's next?">
                  <Text variant="body-small">
                    To learn more about this project, click the "Entity Page"
                    link, where you can view more information about the effort
                    and navigate to the source code itself to begin
                    collaborating.
                  </Text>
                </AboutField>
              </Grid.Item>
            )}

            <Grid.Item colSpan={{ sm: '2' }}>
              <AboutField label="Status">
                <StatusTag status={bazaarProject.status} />
              </AboutField>
            </Grid.Item>

            <Grid.Item colSpan={{ sm: '2' }}>
              <AboutField label="size">
                <Text variant="body-small">{bazaarProject.size}</Text>
              </AboutField>
            </Grid.Item>

            <Grid.Item colSpan={{ sm: '2' }}>
              <AboutField label="Start date">
                <Text variant="body-small">
                  {bazaarProject.startDate?.substring(0, 10) || ''}
                </Text>
              </AboutField>
            </Grid.Item>

            <Grid.Item colSpan={{ sm: '2' }}>
              <AboutField label="End date">
                <Text variant="body-small">
                  {bazaarProject.endDate?.substring(0, 10) || ''}
                </Text>
              </AboutField>
            </Grid.Item>

            <Grid.Item colSpan={{ sm: '4' }}>
              <AboutField label="Responsible">
                <Text variant="body-small">
                  {(() => {
                    try {
                      parseEntityRef(bazaarProject.responsible);
                      return (
                        <EntityRefLink entityRef={bazaarProject.responsible} />
                      );
                    } catch {
                      return bazaarProject.responsible || '';
                    }
                  })()}{' '}
                </Text>
              </AboutField>
            </Grid.Item>
          </Grid.Root>
        </CardBody>
      </Card>
    </div>
  );
};
