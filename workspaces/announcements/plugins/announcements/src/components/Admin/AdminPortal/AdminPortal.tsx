import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Page, Header, Content } from '@backstage/core-components';
import { AnnouncementsContent } from '../AnnouncementsContent';
import { CategoriesContent } from '../CategoriesContent';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { announcementCreatePermission } from '@backstage/community-plugins/backstage-plugin-announcements-common';

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
};

const AdminPortalContent = () => {
  const classes = useStyles();
  const [tab, setTab] = useState('announcements');
  const handleChange = (_event: React.ChangeEvent<{}>, tabValue: string) => {
    setTab(tabValue);
  };

  return (
    <TabContext value={tab}>
      <TabList onChange={handleChange}>
        <Tab label="Announcements" value="announcements" />
        <Tab label="Categories" value="categories" />
      </TabList>
      <TabPanel value="announcements" className={classes.tabPanel}>
        <AnnouncementsContent />
      </TabPanel>
      <TabPanel value="categories" className={classes.tabPanel}>
        <CategoriesContent />
      </TabPanel>
    </TabContext>
  );
};

/** @public */
export const AdminPortal = (props?: AdminPortalProps) => {
  const { title, subtitle, themeId } = props ?? {};

  return (
    <Page themeId={themeId ?? 'tool'}>
      <Header
        title={title ?? 'Admin Portal for Announcements'}
        subtitle={subtitle ?? 'Manage announcements and categories'}
      />
      <RequirePermission permission={announcementCreatePermission}>
        <Content>
          <AdminPortalContent />
        </Content>
      </RequirePermission>
    </Page>
  );
};
