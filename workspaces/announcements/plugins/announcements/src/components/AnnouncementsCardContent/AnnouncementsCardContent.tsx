/*
 * Copyright 2025 The Backstage Authors
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
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@material-ui/core';
import { Link } from '@backstage/core-components';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  announcementCreateRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import { formatAnnouncementStartTime } from '../utils/announcementDateUtils';
import { Progress } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';
import {
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
});

type AnnouncementsListProps = {
  max?: number;
  category?: string;
  active?: boolean;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
};

export const AnnouncementsCardContent = ({
  max,
  category,
  active,
  sortBy,
  order,
}: AnnouncementsListProps) => {
  const { t } = useAnnouncementsTranslation();

  const classes = useStyles();
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const createAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const lastSeen = DateTime.now(); // Replace with actual lastSeen logic if needed
  const { announcements, loading, error } = useAnnouncements({
    max: max || 5,
    category,
    active,
    sortBy,
    order,
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
  return (
    <List dense>
      {announcements.results.map((announcement: any) => (
        <ListItem key={announcement.id}>
          <ListItemIcon
            className={classes.newAnnouncementIcon}
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
              <Link to={viewAnnouncementLink({ id: announcement.id })}>
                {announcement.title}
              </Link>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="textSecondary">
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
                  )}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {announcement.excerpt}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatAnnouncementStartTime(
                    announcement.start_at,
                    t('announcementsCard.occurred'),
                    t('announcementsCard.scheduled'),
                    t('announcementsCard.today'),
                  )}
                </Typography>
              </Box>
            }
          />
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
  );
};
