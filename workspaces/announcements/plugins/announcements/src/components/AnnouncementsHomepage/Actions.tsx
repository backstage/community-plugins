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
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { rootRouteRef } from '../../routes';
import { LinkButton } from '@backstage/core-components';

export const Actions = () => {
  const { t } = useAnnouncementsTranslation();
  const announcementsLink = useRouteRef(rootRouteRef);
  const deepLink = {
    link: announcementsLink(),
    title: t('announcementsCard.seeAll'),
  };
  return (
    <LinkButton variant="contained" color="primary" to={deepLink.link}>
      {deepLink.title}
    </LinkButton>
  );
};
