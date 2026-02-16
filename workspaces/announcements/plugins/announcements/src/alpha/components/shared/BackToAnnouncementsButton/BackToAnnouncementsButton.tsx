/*
 * Copyright 2026 The Backstage Authors
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

import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { useRouteRef } from '@backstage/frontend-plugin-api';
import { Flex, Link, Text } from '@backstage/ui';
import { RiArrowLeftLine } from '@remixicon/react';
import { useLocation } from 'react-router-dom';

import { rootRouteRef, announcementAdminRouteRef } from '../../../../routes';

export const BackToAnnouncementsButton = () => {
  const { t } = useAnnouncementsTranslation();
  const location = useLocation();
  const announcementsLink = useRouteRef(rootRouteRef);
  const adminLink = useRouteRef(announcementAdminRouteRef);

  const queryParams = new URLSearchParams(location.search);
  const fromAdmin = queryParams.get('from') === 'admin';

  const backLink = fromAdmin
    ? adminLink?.() ?? '/'
    : announcementsLink?.() ?? '/';

  const backLinkText = fromAdmin
    ? t('viewAnnouncementPage.backToAdmin')
    : t('viewAnnouncementPage.backToAnnouncements');

  return (
    <Link href={backLink} color="secondary" variant="body-x-small">
      <Flex align="center" gap="2">
        <RiArrowLeftLine size={16} />
        <Text variant="body-small"> {backLinkText}</Text>
      </Flex>
    </Link>
  );
};
