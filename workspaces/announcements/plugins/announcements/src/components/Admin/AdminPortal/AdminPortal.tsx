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
import { Page, Header, Content } from '@backstage/core-components';
import { Tabs, TabList, Tab, TabPanel } from '@backstage/ui';
import { AnnouncementsContent } from '../AnnouncementsContent';
import { CategoriesContent } from '../CategoriesContent';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';
import { TagsContent } from '../TagsContent';

type AdminPortalProps = {
  themeId?: string;
  title?: string;
  subtitle?: string;
  defaultInactive?: boolean;
};

type AdminPortalContentProps = {
  defaultInactive?: boolean;
};

const AdminPortalContent = ({ defaultInactive }: AdminPortalContentProps) => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Tabs>
      <TabList>
        <Tab id="announcements">
          {t('admin.adminPortal.announcementsLabels')}
        </Tab>
        <Tab id="categories">{t('admin.adminPortal.categoriesLabel')}</Tab>
        <Tab id="tags">{t('admin.adminPortal.tagsLabel')}</Tab>
      </TabList>
      <TabPanel id="announcements">
        <AnnouncementsContent defaultInactive={defaultInactive} />
      </TabPanel>
      <TabPanel id="categories">
        <CategoriesContent />
      </TabPanel>
      <TabPanel id="tags">
        <TagsContent />
      </TabPanel>
    </Tabs>
  );
};

/** @public */
export const AdminPortal = (props?: AdminPortalProps) => {
  const { title, subtitle, themeId } = props ?? {};
  const { t } = useAnnouncementsTranslation();

  return (
    <Page themeId={themeId ?? 'tool'}>
      <Header
        title={title ?? t('admin.adminPortal.title')}
        subtitle={subtitle ?? t('admin.adminPortal.title')}
      />
      <RequirePermission permission={announcementCreatePermission}>
        <Content>
          <AdminPortalContent defaultInactive={props?.defaultInactive} />
        </Content>
      </RequirePermission>
    </Page>
  );
};
