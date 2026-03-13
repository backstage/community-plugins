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
import { Routes, Route } from 'react-router-dom';
import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Repositories, RepositoriesContent } from './pages/Repositories';
import { Applications } from './pages/Applications';
import { Header } from './components/Header';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, apiiroApiRef } from './api';

const TabbedHome = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Page themeId="tool">
      <Header />
      <Content>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Apiiro navigation tabs"
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: 'currentColor' },
            }}
          >
            <Tab
              label={
                <Typography
                  variant="h5"
                  sx={{
                    color: 'text.primary',
                    opacity: activeTab === 0 ? 1 : 0.6,
                  }}
                >
                  Applications
                </Typography>
              }
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
            <Tab
              label={
                <Typography
                  variant="h5"
                  sx={{
                    color: 'text.primary',
                    opacity: activeTab === 1 ? 1 : 0.6,
                  }}
                >
                  Repositories
                </Typography>
              }
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Tabs>
        </Box>

        {activeTab === 0 && <Applications />}
        {activeTab === 1 && <RepositoriesContent />}
      </Content>
    </Page>
  );
};

const AppContent = () => {
  const connectApi = useApi(apiiroApiRef);
  const enableApplicationsView = connectApi.getEnableApplicationsView();

  if (enableApplicationsView) {
    return (
      <Routes>
        <Route path="/" element={<TabbedHome />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Repositories />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};
