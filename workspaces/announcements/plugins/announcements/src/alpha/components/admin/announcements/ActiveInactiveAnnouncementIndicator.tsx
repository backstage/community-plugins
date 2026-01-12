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

import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { Flex, Text } from '@backstage/ui';
import { RiCircleFill } from '@remixicon/react';

export const ACTIVE_INDICATOR_COLOR = '#4caf50';
export const INACTIVE_INDICATOR_COLOR = '#f44336';

/**
 * A toolbar style component that displays the active and inactive announcement indicators with labels.
 *
 * @returns
 */
export const ActiveInactiveAnnouncementIndicator = () => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Flex justify="end" gap="6" mb="3">
      <Flex align="center" gap="1">
        <RiCircleFill
          size="12"
          color={ACTIVE_INDICATOR_COLOR}
          aria-label={t('admin.announcementsContent.table.active')}
        />
        <Text variant="body-small">
          {t('admin.announcementsContent.table.active')}
        </Text>
      </Flex>
      <Flex align="center" gap="1">
        <RiCircleFill
          size="12"
          color={INACTIVE_INDICATOR_COLOR}
          aria-label={t('admin.announcementsContent.table.inactive')}
        />
        <Text variant="body-small">
          {t('admin.announcementsContent.table.inactive')}
        </Text>
      </Flex>
    </Flex>
  );
};

/**
 * An icon component that displays the active or inactive announcement indicator.
 *
 * @returns a green or red circle icon indicating the status of the announcement.
 */
export const ActiveInactiveAnnouncementIndicatorIcon = (props: {
  announcement: Announcement;
}) => {
  const { announcement } = props;
  const { t } = useAnnouncementsTranslation();

  return (
    <Flex style={{ flexShrink: 0 }}>
      <RiCircleFill
        size="12"
        color={
          announcement.active
            ? ACTIVE_INDICATOR_COLOR
            : INACTIVE_INDICATOR_COLOR
        }
        aria-label={
          announcement.active
            ? t('admin.announcementsContent.table.active')
            : t('admin.announcementsContent.table.inactive')
        }
      />
    </Flex>
  );
};
