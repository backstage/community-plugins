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
import { ChangeEvent, useState } from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { AnnouncementsContent } from '../AnnouncementsContent';
import { CategoriesContent } from '../CategoriesContent';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { makeStyles, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';
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
  const [tab, setTab] = useState('announcements');
  const { t } = useAnnouncementsTranslation();
  const handleChange = (_event: ChangeEvent<{}>, tabValue: string) => {
    setTab(tabValue);
  };

  return (
    <TabContext value={tab}>
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
