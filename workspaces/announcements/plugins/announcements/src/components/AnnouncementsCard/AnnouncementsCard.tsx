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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import {
  announcementCreateRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import {
  announcementsApiRef,
  useAnnouncements,
} from '@backstage-community/plugin-announcements-react';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
});

type AnnouncementsCardOpts = {
  title?: string;
  max?: number;
  category?: string;
  variant?: InfoCardVariants;
};

export const AnnouncementsCard = ({
  title,
  max,
  category,
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
