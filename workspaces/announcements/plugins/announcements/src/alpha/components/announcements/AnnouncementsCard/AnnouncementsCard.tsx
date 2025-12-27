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
import { DateTime } from 'luxon';
import { useApi, useRouteRef, useAnalytics } from '@backstage/core-plugin-api';
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
  Skeleton,
  Tag,
  TagGroup,
  Text,
} from '@backstage/ui';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementAdminRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../../../routes';
import { formatAnnouncementStartTime } from '../../../../components/utils/announcementDateUtils';

import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';

export type AnnouncementsCardOpts = {
  max?: number;
  category?: string;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
  current?: boolean;
  hideStartAt?: boolean;
};

export const AnnouncementsCard = (props: AnnouncementsCardOpts) => {
  const { max = 5, category, sortBy, order, current, hideStartAt } = props;

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

  if (loading) {
    return <Skeleton />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Card>
      <CardHeader>{t('announcementsCard.announcements')}</CardHeader>
      <CardBody>
        <List dense>
          {announcements.results.map(announcement => (
            <ListItem key={announcement.id}>
              <ListItemIcon
                style={{
                  visibility:
                    lastSeen < DateTime.fromISO(announcement.created_at)
                      ? 'visible'
                      : 'hidden',
                }}
                title={t('announcementsCard.new')}
              >
                <NewReleasesIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link
                    href={viewAnnouncementLink({ id: announcement.id })}
                    // variant="inherit"
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
                }
                secondary={
                  <Box>
                    <Text variant="body-medium" color="secondary">
                      {DateTime.fromISO(announcement.created_at).toRelative()}
                      {announcement.category && (
                        <>
                          {` ${t('announcementsCard.in')} `}
                          <Link
                            href={`${announcementsLink()}?category=${
                              announcement.category.slug
                            }`}
                            // variant="inherit"
                          >
                            {announcement.category.title}
                          </Link>
                        </>
                      )}
                    </Text>
                    <Text variant="body-medium" color="secondary">
                      {announcement.excerpt}
                      {announcement.tags && announcement.tags.length > 0 && (
                        <Box mt="1">
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
                    </Text>
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
                  </Box>
                }
              />{' '}
            </ListItem>
          ))}
          {announcements.count === 0 &&
            !permissions.create.loading &&
            permissions.create.allowed && (
              <ListItem>
                <ListItemText>
                  {`${t('announcementsCard.noAnnouncements')} `}
                  <Link href={announcementAdminLink()}>
                    {t('announcementsCard.addOne')}
                  </Link>
                  ?
                </ListItemText>
              </ListItem>
            )}
        </List>
      </CardBody>
      <CardFooter>
        <Link href={announcementAdminLink()}>
          {t('announcementsCard.seeAll')}
        </Link>
      </CardFooter>
    </Card>
  );
};
