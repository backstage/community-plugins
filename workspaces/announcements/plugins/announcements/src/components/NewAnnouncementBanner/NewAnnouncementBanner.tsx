import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  IconButton,
  makeStyles,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Close from '@material-ui/icons/Close';
import { announcementViewRouteRef } from '../../routes';
import {
  announcementsApiRef,
  useAnnouncements,
} from '@procore-oss/backstage-plugin-announcements-react';
import { Announcement } from '@procore-oss/backstage-plugin-announcements-common';

const useStyles = makeStyles(theme => ({
  // showing on top, as a block
  blockPositioning: {
    padding: theme.spacing(0),
    position: 'relative',
    marginBottom: theme.spacing(4),
    marginTop: -theme.spacing(3),
    zIndex: 'unset',
  },
  // showing on top, as a floating alert
  floatingPositioning: {},
  icon: {
    fontSize: 20,
  },
  bannerIcon: {
    fontSize: 20,
    marginRight: '0.5rem',
  },
  content: {
    width: '100%',
    maxWidth: 'inherit',
    flexWrap: 'nowrap',
    backgroundColor: theme.palette.banner.info,
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.banner.text,
    '& a': {
      color: theme.palette.banner.link,
    },
  },
}));

type AnnouncementBannerProps = {
  announcement: Announcement;
  variant?: 'block' | 'floating';
};

const AnnouncementBanner = (props: AnnouncementBannerProps) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const [bannerOpen, setBannerOpen] = useState(true);
  const variant = props.variant || 'block';
  const announcement = props.announcement;

  const handleClick = () => {
    announcementsApi.markLastSeenDate(
      DateTime.fromISO(announcement.created_at),
    );
    setBannerOpen(false);
  };

  const message = (
    <>
      <span className={classes.bannerIcon}>📣</span>
      <Link to={viewAnnouncementLink({ id: announcement.id })}>
        {announcement.title}
      </Link>
      &nbsp;– {announcement.excerpt}
    </>
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={bannerOpen}
      className={
        variant === 'block'
          ? classes.blockPositioning
          : classes.floatingPositioning
      }
    >
      <SnackbarContent
        className={classes.content}
        message={message}
        action={[
          <IconButton
            key="dismiss"
            title="Mark as seen"
            color="inherit"
            onClick={handleClick}
          >
            <Close className={classes.icon} />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};

type NewAnnouncementBannerProps = {
  variant?: 'block' | 'floating';
  max?: number;
  category?: string;
};

export const NewAnnouncementBanner = (props: NewAnnouncementBannerProps) => {
  const announcementsApi = useApi(announcementsApiRef);

  const { announcements, loading, error } = useAnnouncements({
    max: props.max || 1,
    category: props.category,
  });
  const lastSeen = announcementsApi.lastSeenDate();

  if (loading) {
    return null;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (announcements.count === 0) {
    return null;
  }

  const unseenAnnouncements = announcements.results.filter(announcement => {
    return lastSeen < DateTime.fromISO(announcement.created_at);
  });

  if (unseenAnnouncements?.length === 0) {
    return null;
  }

  return (
    <>
      {unseenAnnouncements.map(announcement => (
        <AnnouncementBanner
          key={announcement.id}
          announcement={announcement}
          variant={props.variant}
        />
      ))}
    </>
  );
};
