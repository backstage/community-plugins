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
import { formatAnnouncementStartTime } from '../utils/announcementDateUtils';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  makeStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
  chipStyle: {
    marginRight: 4,
    marginBottom: 4,
  },
});

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
    sortBy,
    order,
    current,
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
                <Link
                  to={viewAnnouncementLink({ id: announcement.id })}
                  variant="inherit"
                >
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
                          variant="inherit"
                        >
                          {announcement.category.title}
                        </Link>
                      </>
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {announcement.excerpt}
                    {announcement.tags && announcement.tags.length > 0 && (
                      <Box mt={1}>
                        {announcement.tags.map(tag => (
                          <Chip
                            key={tag.slug}
                            size="small"
                            label={tag.title}
                            component={Link}
                            to={`${announcementsLink()}?tags=${tag.slug}`}
                            clickable
                            className={classes.chipStyle}
                          />
                        ))}
                      </Box>
                    )}
                  </Typography>
                  {!hideStartAt && (
                    <Typography variant="caption" color="textSecondary">
                      {formatAnnouncementStartTime(
                        announcement.start_at,
                        t('announcementsCard.occurred'),
                        t('announcementsCard.scheduled'),
                        t('announcementsCard.today'),
                      )}
                    </Typography>
                  )}
                </Box>
              }
            />{' '}
          </ListItem>
        ))}
        {announcements.count === 0 && !loadingPermission && canAdd && (
          <ListItem>
            <ListItemText>
              {`${t('announcementsCard.noAnnouncements')} `}
              <Link to={createAnnouncementLink()} variant="inherit">
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
