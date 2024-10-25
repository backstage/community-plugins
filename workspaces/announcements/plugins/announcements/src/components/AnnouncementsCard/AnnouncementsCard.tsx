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
import makeStyles from '@mui/styles/makeStyles';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import {
  announcementCreateRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import {
  announcementsApiRef,
  useAnnouncements,
} from '@backstage-community/plugin-announcements-react';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

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
    title: 'See all',
  };

  return (
    <InfoCard
      title={title || 'Announcements'}
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
                  title="New"
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
                        {' '}
                        in{' '}
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
              No announcements yet, want to{' '}
              <Link to={createAnnouncementLink()}>add one</Link>?
            </ListItemText>
          </ListItem>
        )}
      </List>
    </InfoCard>
  );
};
