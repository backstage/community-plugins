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

import { TextField } from '@backstage/ui';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

type AnnouncementsSearchFieldProps = {
  initialSearchQuery?: string;
  setSearchQuery: (query: string) => void;
  hideLabel?: boolean;
};

export const AnnouncementsSearchField = ({
  initialSearchQuery = '',
  setSearchQuery,
  hideLabel = false,
}: AnnouncementsSearchFieldProps) => {
  const { t } = useAnnouncementsTranslation();

  return (
    <TextField
      label={hideLabel ? null : t('announcementsPage.filter.announcements')}
      placeholder={t('announcementsPage.filter.announcementsSearchPlaceholder')}
      value={initialSearchQuery}
      onChange={setSearchQuery}
      size="small"
    />
  );
};
