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
import { useRouteRef } from '@backstage/core-plugin-api';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { ButtonIcon, Menu, MenuItem, MenuTrigger } from '@backstage/ui';
import { RiMore2Fill } from '@remixicon/react';

import { announcementAdminRouteRef } from '../../../routes';

/**
 * @remarks - does not include permissions check
 * @internal
 */
export const ContextMenu = () => {
  const { t } = useAnnouncementsTranslation();

  const adminRoute = useRouteRef(announcementAdminRouteRef);
  const adminRouteLinkName = t('announcementsPage.contextMenu.admin');

  return (
    <MenuTrigger>
      <ButtonIcon icon={<RiMore2Fill />} variant="tertiary" />
      <Menu placement="bottom end">
        <MenuItem href={adminRoute()}>{adminRouteLinkName}</MenuItem>
      </Menu>
    </MenuTrigger>
  );
};
