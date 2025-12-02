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
import { RequirePermission } from '@backstage/plugin-permission-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { makeStyles, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { useLocation, useNavigate } from 'react-router-dom';

import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';

import {
  adminAnnouncementsRouteRef,
  adminCategoriesRouteRef,
  adminTagsRouteRef,
} from '../../../routes';

import { AnnouncementsContent } from '../AnnouncementsContent';
import { CategoriesContent } from '../CategoriesContent';
import { TagsContent } from '../TagsContent';

const useStyles = makeStyles(() => ({
  tabPanel: {
    paddingLeft: '0px',
    paddingRight: '0px',
  },
}));

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
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAnnouncementsTranslation();

  const announcementsPath = useRouteRef(adminAnnouncementsRouteRef);
  const categoriesPath = useRouteRef(adminCategoriesRouteRef);
  const tagsPath = useRouteRef(adminTagsRouteRef);

  // Determine current tab from URL
  const getCurrentTab = () => {
    if (location.pathname.includes('/categories')) return 'categories';
    if (location.pathname.includes('/tags')) return 'tags';
    return 'announcements';
  };

  const handleChange = (_event: React.ChangeEvent<{}>, tabValue: string) => {
    switch (tabValue) {
      case 'categories':
        navigate(categoriesPath());
        break;
      case 'tags':
        navigate(tagsPath());
        break;
      default:
        navigate(announcementsPath());
    }
  };

  const currentTab = getCurrentTab();

  return (
    <TabContext value={currentTab}>
      <TabList onChange={handleChange}>
        <Tab
          label={t('admin.adminPortal.announcementsLabels')}
          value="announcements"
        />
        <Tab
          label={t('admin.adminPortal.categoriesLabel')}
          value="categories"
        />
        <Tab label={t('admin.adminPortal.tagsLabel')} value="tags" />
      </TabList>
      <TabPanel value="announcements" className={classes.tabPanel}>
        <AnnouncementsContent defaultInactive={defaultInactive} />
      </TabPanel>
      <TabPanel value="categories" className={classes.tabPanel}>
        <CategoriesContent />
      </TabPanel>
      <TabPanel value="tags" className={classes.tabPanel}>
        <TagsContent />
      </TabPanel>
    </TabContext>
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
