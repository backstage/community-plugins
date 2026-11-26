/*
 * Copyright 2021 The Backstage Authors
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
import type { ReactNode } from 'react';
import { Box, Header, Tab, TabList, Tabs } from '@backstage/ui';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Overview } from '../Overview';
import { buildsRouteRef } from '../../routes';
import { BuildList } from '../BuildList';

export interface TabConfig {
  path: string;
  title: string;
  component: ReactNode;
}

const TABS: TabConfig[] = [
  {
    path: '/',
    title: 'Overview',
    component: <Overview />,
  },
  {
    path: buildsRouteRef.path,
    title: 'Builds',
    component: <BuildList />,
  },
];

const XcmetricsTabs = () => {
  const basePath = useResolvedPath('.').pathname.replace(/\/$/, '');

  return (
    <>
      <Tabs>
        <TabList>
          {TABS.map(tab => (
            <Tab
              key={tab.path}
              id={tab.path}
              href={
                tab.path === '/' ? basePath || '/' : `${basePath}${tab.path}`
              }
              matchStrategy={tab.path === '/' ? 'exact' : 'prefix'}
            >
              {tab.title}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <Box p="6">
        <Routes>
          {TABS.map(tab => (
            <Route
              key={tab.path}
              path={tab.path === '/' ? '/' : `${tab.path}/*`}
              element={tab.component}
            />
          ))}
        </Routes>
      </Box>
    </>
  );
};

// Used by the old frontend system — includes the full page shell
export const XcmetricsLayout = () => (
  <>
    <Header
      title="XCMetrics"
      description="Dashboard"
      metadata={[
        { label: 'Owner', value: 'Spotify' },
        { label: 'Lifecycle', value: 'Alpha' },
      ]}
    />
    <XcmetricsTabs />
  </>
);

// Used by the new frontend system — no page shell, just content.
// The framework's PageLayout/PluginHeader provides the outer page shell.
export const NfsXcmetricsLayout = () => <XcmetricsTabs />;
