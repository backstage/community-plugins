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
import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';
import {
  AnnouncementsAdminPage,
  CategoriesContent,
  TagsContent,
  AnnouncementsPage,
  AnnouncementsPageProps,
  ViewAnnouncementPage,
} from './components';

// todo: pending rebuild for nfs with `@backstage/ui`
import { AnnouncementsContent, MarkdownRendererTypeProps } from '../components';

type RouterProps = {
  title?: string;
  category?: string;
  hideStartAt?: boolean;
  markdownRenderer?: MarkdownRendererTypeProps;
  defaultInactive?: boolean;
};

export const Router = (props: RouterProps) => {
  const propsWithDefaults: AnnouncementsPageProps = {
    title: 'Announcements',
    hideStartAt: false,
    markdownRenderer: 'backstage',
    ...props,
  };

  return (
    <Routes>
      <Route path="/" element={<AnnouncementsPage {...propsWithDefaults} />} />
      <Route
        path="/view/:id"
        element={
          <ViewAnnouncementPage
            markdownRenderer={propsWithDefaults.markdownRenderer}
            title={propsWithDefaults.title}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <RequirePermission permission={announcementCreatePermission}>
            <AnnouncementsAdminPage
              title={props.title}
              defaultInactive={props.defaultInactive}
            />
          </RequirePermission>
        }
      >
        <Route
          path=""
          element={
            <AnnouncementsContent defaultInactive={props.defaultInactive} />
          }
        />
        <Route path="categories" element={<CategoriesContent />} />
        <Route path="tags" element={<TagsContent />} />
      </Route>
    </Routes>
  );
};
