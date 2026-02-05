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
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Link, Alert, ButtonIcon } from '@backstage/ui';
import { useApi, useRouteRef, useAnalytics } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  AnnouncementSignal,
  MAX_EXCERPT_LENGTH,
  MAX_TITLE_LENGTH,
  SIGNALS_CHANNEL_ANNOUNCEMENTS,
} from '@backstage-community/plugin-announcements-common';
import { useSignal } from '@backstage/plugin-signals-react';
import { RiInformationLine, RiCloseLine } from '@remixicon/react';

import { announcementViewRouteRef } from '../../../routes';
import { truncate } from '../../../components/utils/truncateUtils';

type CardOptions = {
  titleLength?: number;
  excerptLength?: number;
};

type AnnouncementBannerProps = {
  announcement: Announcement;
  cardOptions?: CardOptions;
};

const AnnouncementBanner = (props: AnnouncementBannerProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const analytics = useAnalytics();
  const { t } = useAnnouncementsTranslation();
  const [bannerOpen, setBannerOpen] = useState(true);
  const announcement = props.announcement;
  const titleLength = props.cardOptions?.titleLength;
  const excerptLength = props.cardOptions?.excerptLength;

  const markSeen = () => {
    announcementsApi.markLastSeenDate(
      DateTime.fromISO(announcement.created_at),
    );
    setBannerOpen(false);
  };

  const handleLinkClick = () => {
    analytics.captureEvent('click', announcement.title, {
      attributes: {
        announcementId: announcement.id,
        location: 'NewAnnouncementBanner',
      },
    });

    markSeen();
  };

  const handleDismiss = () => {
    analytics.captureEvent('dismiss', announcement.title, {
      attributes: {
        announcementId: announcement.id,
        location: 'NewAnnouncementBanner',
      },
    });

    markSeen();
  };

  const title = titleLength
    ? truncate(announcement.title, titleLength)
    : announcement.title;
  const excerpt = excerptLength
    ? truncate(announcement.excerpt, excerptLength)
    : announcement.excerpt;

  useEffect(() => {
    if (!bannerOpen) {
      return;
    }

    analytics.captureEvent('view', announcement.title, {
      attributes: {
        announcementId: announcement.id,
        location: 'NewAnnouncementBanner',
      },
    });
  }, [analytics, announcement.id, announcement.title, bannerOpen]);

  if (!bannerOpen) {
    return null;
  }

  const floatingStyle: React.CSSProperties = {
    position: 'fixed',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    width: 'auto',
    maxWidth: '90%',
    boxShadow:
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  };

  return (
    <Alert
      style={floatingStyle}
      status="info"
      icon={<RiInformationLine />}
      title={
        <>
          <Link
            href={viewAnnouncementLink({ id: announcement.id })}
            onClick={handleLinkClick}
            variant="body-large"
          >
            {title} &nbsp;– {excerpt}
          </Link>
        </>
      }
      customActions={
        <ButtonIcon
          icon={<RiCloseLine />}
          aria-label={t('newAnnouncementBanner.markAsSeen')}
          onPress={handleDismiss}
          variant="tertiary"
        />
      }
      mb="4"
    />
  );
};

export type NewAnnouncementBannerProps = {
  max?: number;
  category?: string;
  active?: boolean;
  current?: boolean;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at';
  cardOptions?: CardOptions;
};

export const NewAnnouncementBanner = (props: NewAnnouncementBannerProps) => {
  const {
    max,
    category,
    tags,
    active,
    current,
    sortBy,
    cardOptions = {
      titleLength: MAX_TITLE_LENGTH,
      excerptLength: MAX_EXCERPT_LENGTH,
    },
  } = props;

  const announcementsApi = useApi(announcementsApiRef);

  const [signaledAnnouncement, setSignaledAnnouncement] = useState<
    AnnouncementSignal['data'] | undefined
  >();

  const { announcements, loading, error } = useAnnouncements({
    max: max ?? 1,
    category,
    tags,
    active,
    current,
    sortBy,
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
    return <Alert status="danger" title={error.message} />;
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
          cardOptions={cardOptions}
        />
      ))}
    </>
  );
};
