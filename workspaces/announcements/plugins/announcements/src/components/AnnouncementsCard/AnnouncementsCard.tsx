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
import { DateTime } from 'luxon';
import {
  InfoCard,
  InfoCardVariants,
  Progress,
} from '@backstage/core-components';
import { useApi, useRouteRef, useAnalytics } from '@backstage/core-plugin-api';
import {
  announcementAdminRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import { formatAnnouncementStartTime } from '../utils/announcementDateUtils';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import {
  Alert,
  Box,
  Flex,
  Link,
  List,
  ListRow,
  Tag,
  TagGroup,
  Text,
} from '@backstage/ui';
import { RiMegaphoneLine } from '@remixicon/react';

type AnnouncementsCardOpts = {
  title?: string;
  max?: number;
  category?: string;
  active?: boolean;
  variant?: InfoCardVariants;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
  current?: boolean;
  hideStartAt?: boolean;
};

export const AnnouncementsCard = ({
  title,
  max,
  category,
  active,
  variant = 'gridItem',
  sortBy,
  order,
  current,
  hideStartAt,
}: AnnouncementsCardOpts) => {
  const announcementsApi = useApi(announcementsApiRef);
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const announcementAdminLink = useRouteRef(announcementAdminRouteRef);
  const lastSeen = announcementsApi.lastSeenDate();
  const analytics = useAnalytics();
  const { t } = useAnnouncementsTranslation();

  const { announcements, loading, error } = useAnnouncements({
    max: max || 5,
    category,
    active,
    sortBy,
    order,
    current,
  });

  const permissions = useAnnouncementsPermissions();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert status="danger" title={error.message} />;
  }

  const deepLink = {
    link: announcementsLink(),
    title: t('announcementsCard.seeAll'),
  };

  return (
    <InfoCard
      title={title || t('announcementsCard.announcements')}
      variant={variant}
      deepLink={deepLink}
    >
      <List
        aria-label={title || t('announcementsCard.announcements')}
        items={announcements.results}
        renderEmptyState={
          !permissions.create.loading && permissions.create.allowed
            ? () => (
                <Text as="span">
                  {`${t('announcementsCard.noAnnouncements')} `}
                  <Link href={announcementAdminLink()}>
                    {t('announcementsCard.addOne')}
                  </Link>
                  ?
                </Text>
              )
            : undefined
        }
      >
        {announcement => (
          <ListRow
            id={announcement.id}
            textValue={announcement.title}
            icon={
              <Box
                style={{
                  visibility:
                    lastSeen < DateTime.fromISO(announcement.created_at)
                      ? 'visible'
                      : 'hidden',
                }}
                title={t('announcementsCard.new')}
              >
                <RiMegaphoneLine size={20} />
              </Box>
            }
          >
            <Flex direction="column" gap="1">
              <Link
                href={viewAnnouncementLink({ id: announcement.id })}
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

              <Text variant="body-small" color="secondary" as="span">
                {DateTime.fromISO(announcement.created_at).toRelative()}
                {announcement.category && (
                  <>
                    {` ${t('announcementsCard.in')} `}
                    <Link
                      href={`${announcementsLink()}?category=${
                        announcement.category.slug
                      }`}
                    >
                      {announcement.category.title}
                    </Link>
                  </>
                )}
              </Text>

              <Text variant="body-small" color="secondary">
                {announcement.excerpt}
              </Text>

              {announcement.tags && announcement.tags.length > 0 && (
                <Box mt="2">
                  <TagGroup>
                    {announcement.tags.map(tag => (
                      <Tag
                        key={tag.slug}
                        size="small"
                        href={`${announcementsLink()}?tags=${tag.slug}`}
                      >
                        {tag.title}
                      </Tag>
                    ))}
                  </TagGroup>
                </Box>
              )}

              {!hideStartAt && (
                <Text variant="body-x-small" color="secondary">
                  {formatAnnouncementStartTime(
                    announcement.start_at,
                    t('announcementsCard.occurred'),
                    t('announcementsCard.scheduled'),
                    t('announcementsCard.today'),
                  )}
                </Text>
              )}
            </Flex>
          </ListRow>
        )}
      </List>
    </InfoCard>
  );
};
