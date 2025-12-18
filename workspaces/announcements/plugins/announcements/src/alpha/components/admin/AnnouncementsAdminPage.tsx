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
import { Container, HeaderPage } from '@backstage/ui';
import { Outlet } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  adminCategoriesRouteRef,
  announcementAdminRouteRef,
  adminTagsRouteRef,
  rootRouteRef,
} from '../../../routes';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

export type AnnouncementsAdminPageProps = {
  title?: string;
  defaultInactive?: boolean;
};

export function AnnouncementsAdminPage(props: AnnouncementsAdminPageProps) {
  const { title } = props;

  const announcementsRoute = useRouteRef(rootRouteRef);
  const adminRoute = useRouteRef(announcementAdminRouteRef);
  const adminCategoriesRoute = useRouteRef(adminCategoriesRouteRef);
  const adminTagsRoute = useRouteRef(adminTagsRouteRef);

  const { t } = useAnnouncementsTranslation();
  const announcementsLabel = t('admin.adminPortal.announcementsLabels');
  const categoriesLabel = t('admin.adminPortal.categoriesLabel');
  const tagsLabel = t('admin.adminPortal.tagsLabel');

  return (
    <>
      <HeaderPage
        title={title ? title : t('admin.adminPortal.title')}
        breadcrumbs={[
          { label: announcementsLabel, href: announcementsRoute() },
        ]}
        tabs={[
          {
            id: 'announcements',
            label: announcementsLabel,
            href: adminRoute(),
          },
          {
            id: 'categories',
            label: categoriesLabel,
            href: adminCategoriesRoute(),
          },
          {
            id: 'tags',
            label: tagsLabel,
            href: adminTagsRoute(),
          },
        ]}
      />

      <Container data-testid="announcements-admin-page-container-outlet">
        <Outlet />
      </Container>
    </>
  );
}
