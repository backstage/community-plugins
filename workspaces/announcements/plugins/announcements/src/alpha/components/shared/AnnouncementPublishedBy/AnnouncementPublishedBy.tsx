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
import { useRouteRef } from '@backstage/frontend-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { Text, Link } from '@backstage/ui';

import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { rootRouteRef } from '../../../../routes';

type AnnouncementPublishedByProps = {
  announcement: Announcement;
};

export const AnnouncementPublishedBy = ({
  announcement,
}: AnnouncementPublishedByProps) => {
  const { t } = useAnnouncementsTranslation();

  const announcementsLink = useRouteRef(rootRouteRef);

  return (
    <Text variant="body-small" as="span">
      {t('announcementsPage.card.by')}{' '}
      <EntityRefLink
        entityRef={announcement.on_behalf_of || announcement.publisher}
        hideIcon
      />
      {announcement.category && (
        <>
          {' '}
          {t('announcementsPage.card.in')}{' '}
          <Link
            href={`${announcementsLink?.()}?category=${
              announcement.category.slug
            }`}
          >
            {announcement.category.title}
          </Link>
        </>
      )}
      , {DateTime.fromISO(announcement.created_at).toRelative()}
    </Text>
  );
};
