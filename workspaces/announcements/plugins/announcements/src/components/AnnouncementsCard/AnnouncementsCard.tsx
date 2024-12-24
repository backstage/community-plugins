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
import React from 'react';
import { DateTime } from 'luxon';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  InfoCard,
  InfoCardVariants,
  Link,
  Progress,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';
import {
  announcementCreateRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@procore-oss/backstage-plugin-announcements-react';
import {
  makeStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
});

type AnnouncementsCardOpts = {
  title?: string;
  max?: number;
  category?: string;
  active?: boolean;
  variant?: InfoCardVariants;
};

export const AnnouncementsCard = ({
  title,
  max,
  category,
  active,
  variant = 'gridItem',
}: AnnouncementsCardOpts) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const createAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const lastSeen = announcementsApi.lastSeenDate();
  const { t } = useAnnouncementsTranslation();

  const { announcements, loading, error } = useAnnouncements({
    max: max || 5,
    category,
    active,
  });

  const { announcementCreatePermission } = announcementEntityPermissions;
  const { loading: loadingPermission, allowed: canAdd } = usePermission({
    permission: announcementCreatePermission,
  });

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
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
      <List dense>
        {announcements.results.map(announcement => (
          <ListItem key={announcement.id}>
            <ListItem>
              {lastSeen < DateTime.fromISO(announcement.created_at) && (
                <ListItemIcon
                  className={classes.newAnnouncementIcon}
                  title={t('announcementsCard.new')}
                >
                  <NewReleasesIcon />
                </ListItemIcon>
              )}

              <ListItemText
                primary={
                  <Link to={viewAnnouncementLink({ id: announcement.id })}>
                    {announcement.title}
                  </Link>
                }
                secondary={
                  <>
                    {DateTime.fromISO(announcement.created_at).toRelative()}
                    {announcement.category && (
                      <>
                        {` ${t('announcementsCard.in')} `}
                        <Link
                          to={`${announcementsLink()}?category=${
                            announcement.category.slug
                          }`}
                        >
                          {announcement.category.title}
                        </Link>
                      </>
                    )}{' '}
                    – {announcement.excerpt}
                  </>
                }
              />
            </ListItem>
          </ListItem>
        ))}
        {announcements.count === 0 && !loadingPermission && canAdd && (
          <ListItem>
            <ListItemText>
              {`${t('announcementsCard.noAnnouncements')} `}
              <Link to={createAnnouncementLink()}>
                {t('announcementsCard.addOne')}
              </Link>
              ?
            </ListItemText>
          </ListItem>
        )}
      </List>
    </InfoCard>
  );
};
