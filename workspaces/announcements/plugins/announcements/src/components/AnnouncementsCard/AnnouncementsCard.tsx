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
import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { AnnouncementsCardContent } from '../AnnouncementsCardContent';
import { rootRouteRef } from '../../routes';

type AnnouncementsCardOpts = {
  title?: string;
  max?: number;
  category?: string;
  active?: boolean;
  variant?: InfoCardVariants;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
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
  hideStartAt,
}: AnnouncementsCardOpts) => {
  const { t } = useAnnouncementsTranslation();
  const announcementsLink = useRouteRef(rootRouteRef);
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
      <AnnouncementsCardContent
        max={max}
        category={category}
        active={active}
        sortBy={sortBy}
        order={order}
        hideStartAt={hideStartAt}
      />
    </InfoCard>
  );
};
