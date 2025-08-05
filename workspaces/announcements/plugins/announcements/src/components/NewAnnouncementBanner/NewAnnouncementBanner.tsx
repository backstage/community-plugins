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
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { announcementViewRouteRef } from '../../routes';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  AnnouncementSignal,
  SIGNALS_CHANNEL_ANNOUNCEMENTS,
} from '@backstage-community/plugin-announcements-common';
import { useSignal } from '@backstage/plugin-signals-react';
import {
  makeStyles,
  Snackbar,
  SnackbarContent,
  IconButton,
  Typography,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles(theme => {
  return {
    // showing on top, as a block
    blockPositioning: {
      padding: theme?.spacing?.(0) ?? 0,
      position: 'relative',
      marginBottom: theme?.spacing?.(4) ?? 32,
      marginTop: theme?.spacing?.(3) ?? -24,
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
      backgroundColor: theme?.palette?.banner?.info ?? '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      color: theme?.palette?.banner?.text ?? '#000000',
      '& a': {
        color: theme?.palette?.banner?.link ?? '#0068c8',
      },
    },
  };
});

type AnnouncementBannerProps = {
  announcement: Announcement;
  variant?: 'block' | 'floating';
};

const AnnouncementBanner = (props: AnnouncementBannerProps) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const { t } = useAnnouncementsTranslation();
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
      <Typography
        component="span"
        className={classes.bannerIcon}
        variant="inherit"
      >
        📣
      </Typography>
      <Link
        to={viewAnnouncementLink({ id: announcement.id })}
        variant="inherit"
      >
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
            title={t('newAnnouncementBanner.markAsSeen')}
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
  active?: boolean;
  tags?: string[];
};

export const NewAnnouncementBanner = (props: NewAnnouncementBannerProps) => {
  const { max, category, tags, active, variant } = props;

  const announcementsApi = useApi(announcementsApiRef);

  const [signaledAnnouncement, setSignaledAnnouncement] = useState<
    AnnouncementSignal['data'] | undefined
  >();

  const { announcements, loading, error } = useAnnouncements({
    max: max ?? 1,
    category,
    tags,
    active,
  });
  const lastSeen = announcementsApi.lastSeenDate();

  const { lastSignal } = useSignal<AnnouncementSignal>(
    SIGNALS_CHANNEL_ANNOUNCEMENTS,
  );

  useEffect(() => {
    if (!lastSignal) {
      return;
    }

    setSignaledAnnouncement(lastSignal?.data);
  }, [lastSignal]);

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

  if (signaledAnnouncement) {
    unseenAnnouncements.push(signaledAnnouncement);
  }

  if (unseenAnnouncements?.length === 0) {
    return null;
  }

  return (
    <>
      {unseenAnnouncements.map(announcement => (
        <AnnouncementBanner
          key={announcement.id}
          announcement={announcement}
          variant={variant}
        />
      ))}
    </>
  );
};
