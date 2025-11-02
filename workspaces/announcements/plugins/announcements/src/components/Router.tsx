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
import { Routes, Route } from 'react-router-dom';
import { RequirePermission } from '@backstage/plugin-permission-react';
import {
  announcementCreatePermission,
  announcementUpdatePermission,
} from '@backstage-community/plugin-announcements-common';
import {
  announcementAdminRouteRef,
  announcementCreateRouteRef,
  announcementEditRouteRef,
  announcementViewRouteRef,
  categoriesListRouteRef,
  tagsListRouteRef,
} from '../routes';
import { AnnouncementsPage, AnnouncementsPageProps } from './AnnouncementsPage';
import { AnnouncementPage } from './AnnouncementPage';
import { CreateAnnouncementPage } from './CreateAnnouncementPage';
import { EditAnnouncementPage } from './EditAnnouncementPage';
import { CategoriesPage } from './CategoriesPage';
import { AdminPortal } from './Admin';
import { MarkdownRendererTypeProps } from './MarkdownRenderer';
import { TagsPage } from './TagsPage';

type RouterProps = {
  themeId?: string;
  title?: string;
  subtitle?: string;
  category?: string;
  hideContextMenu?: boolean;
  cardOptions?: {
    titleLength: number | undefined;
  };
  buttonOptions?: {
    name: string | undefined;
  };
  hideInactive?: boolean;
  hideStartAt?: boolean;
  markdownRenderer?: MarkdownRendererTypeProps;
  defaultInactive?: boolean;
};

export const Router = (props: RouterProps) => {
  const propsWithDefaults: AnnouncementsPageProps = {
    themeId: 'home',
    title: 'Announcements',
    hideInactive: false,
    hideStartAt: false,
    markdownRenderer: 'backstage',
    ...props,
  };

  return (
    <Routes>
      <Route path="/" element={<AnnouncementsPage {...propsWithDefaults} />} />
      <Route
        path={`${announcementViewRouteRef.path}`}
        element={<AnnouncementPage {...propsWithDefaults} />}
      />
      <Route
        path={`${announcementCreateRouteRef.path}`}
        element={
          <RequirePermission permission={announcementCreatePermission}>
            <CreateAnnouncementPage {...propsWithDefaults} />
          </RequirePermission>
        }
      />
      <Route
        path={`${announcementEditRouteRef.path}`}
        element={
          <RequirePermission permission={announcementUpdatePermission}>
            <EditAnnouncementPage {...propsWithDefaults} />
          </RequirePermission>
        }
      />
      <Route
        path={`${announcementAdminRouteRef.path}`}
        element={
          <RequirePermission permission={announcementCreatePermission}>
            <AdminPortal />
          </RequirePermission>
        }
      />

      <Route
        path={`${categoriesListRouteRef.path}`}
        element={<CategoriesPage {...propsWithDefaults} />}
      />

      <Route
        path={`${tagsListRouteRef.path}`}
        element={<TagsPage {...propsWithDefaults} />}
      />
    </Routes>
  );
};
