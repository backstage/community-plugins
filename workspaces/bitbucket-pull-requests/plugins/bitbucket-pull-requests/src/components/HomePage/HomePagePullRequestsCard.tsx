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
import { useState } from 'react';
import { Tabs, Tab, Box } from '@material-ui/core';
import { HomePagePullRequestsTable } from './HomePagePullRequestsTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pr-tabpanel-${index}`}
      aria-labelledby={`pr-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `pr-tab-${index}`,
    'aria-controls': `pr-tabpanel-${index}`,
  };
}

/**
 * Props for the HomePagePullRequestsCard component
 *
 * @public
 */
export interface HomePagePullRequestsCardProps {
  /**
   * Flag to determine whether to display build status information in the pull requests table.
   * Defaults to true if not specified.
   */
  buildStatus?: boolean;
}

/**
 * Component to display pull requests as tabs on the homepage
 *
 * @public
 */
export const HomePagePullRequestsCard = ({
  buildStatus = true,
}: HomePagePullRequestsCardProps = {}) => {
  const [value, setValue] = useState(0);

  const handleChange = (
    _event: globalThis.React.ChangeEvent<{}>,
    newValue: number,
  ) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="Pull Requests tabs"
      >
        <Tab label="Authored by Me" {...a11yProps(0)} />
        <Tab label="Assigned to Me" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <HomePagePullRequestsTable
          userRole="AUTHOR"
          buildStatus={buildStatus}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <HomePagePullRequestsTable
          userRole="REVIEWER"
          buildStatus={buildStatus}
        />
      </TabPanel>
    </Box>
  );
};
