/*
 * Copyright 2026 The Backstage Authors
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
  Box,
  ButtonLink,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Link,
  Skeleton,
  Text,
} from '@backstage/ui';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import {
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/frontend-plugin-api';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';

import {
  announcementAdminRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../../../routes';
import { AnnouncementPublishedBy, AnnouncementTags } from '../../shared';

export type AnnouncementsCardOpts = {
  max?: number;
  category?: string;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
  current?: boolean;
};

export const AnnouncementsCard = (props: AnnouncementsCardOpts) => {
  const { max = 5, category, sortBy, order, current } = props;

  const announcementsApi = useApi(announcementsApiRef);
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const announcementAdminLink = useRouteRef(announcementAdminRouteRef);
  const lastSeen = announcementsApi.lastSeenDate();
  const analytics = useAnalytics();
  const { t } = useAnnouncementsTranslation();

  const { announcements, loading, error } = useAnnouncements({
    max,
    category,
    active: true,
    sortBy,
    order,
    current,
  });

  const permissions = useAnnouncementsPermissions();
  const canCreate = permissions.create.allowed && !permissions.create.loading;

  if (loading) {
    return <Skeleton />;
  } else if (error) {
    return <Text color="danger">{error.message}</Text>;
  }

  return (
    <Card>
      <CardHeader>
        <Flex align="center" gap="2">
          <RecordVoiceOverIcon />
          <Text variant="title-small">
            {t('announcementsCard.announcements')}
          </Text>
        </Flex>
      </CardHeader>

      {/* <Box
          style={{
            visibility:
              lastSeen < DateTime.fromISO(announcement.created_at)
                ? 'visible'
                : 'hidden',
          }}
        >
          <Text variant="body-small">{t('announcementsCard.new')}</Text>
          <RecordVoiceOverIcon />
        </Box> */}

      <CardBody>
        <Flex direction="column" gap="4">
          {announcements.results.map((announcement, index) => (
            <Box
              key={announcement.id}
              pb="4"
              style={
                index < announcements.results.length - 1
                  ? { borderBottom: '1px solid var(--bui-border)' }
                  : undefined
              }
            >
              <Flex direction="column" gap="1.5">
                <Link
                  variant="title-x-small"
                  weight="bold"
                  href={viewAnnouncementLink?.({ id: announcement.id })}
                  onClick={() =>
                    analytics.captureEvent('click', announcement.title, {
                      attributes: {
                        announcementId: announcement.id,
                        location: 'AnnouncementsCard',
                      },
                    })
                  }
                >
                  {announcement.title}
                </Link>

                <AnnouncementPublishedBy announcement={announcement} />

                <Text variant="body-small" color="secondary">
                  {announcement.excerpt}
                </Text>

                <AnnouncementTags tags={announcement.tags} />
              </Flex>
            </Box>
          ))}

          {announcements.count === 0 && canCreate && (
            <Text variant="body-medium">
              {`${t('announcementsCard.noAnnouncements')} `}
              <Link href={announcementAdminLink?.()}>
                {t('announcementsCard.addOne')}
              </Link>
              ?
            </Text>
          )}
        </Flex>
      </CardBody>

      <CardFooter>
        <Flex justify="end">
          <ButtonLink href={announcementsLink?.()} variant="tertiary">
            {t('announcementsCard.seeAll')}
          </ButtonLink>
        </Flex>
      </CardFooter>
    </Card>
  );
};
