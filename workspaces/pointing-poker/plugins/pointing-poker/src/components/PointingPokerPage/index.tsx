/*
 * Copyright 2026 The Backstage Authors
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
import { type Key, useState } from 'react';
import {
  Container,
  PluginHeader,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@backstage/ui';
import { LiveSessionTab } from '../LiveSessionTab';
import { HistoryTab } from '../HistoryTab';
import { SettingsTab } from '../SettingsTab';
import { OverviewTab } from '../OverviewTab';

const ACTIVE_TAB_KEY = 'pointing-poker.active-tab';
const TAB_IDS = ['overview', 'live-session', 'history', 'settings'] as const;
type TabId = (typeof TAB_IDS)[number];

const getInitialTab = (): TabId => {
  const saved = window.sessionStorage.getItem(ACTIVE_TAB_KEY);
  return TAB_IDS.includes(saved as TabId) ? (saved as TabId) : 'overview';
};

export function PointingPokerPage() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  const handleTabChange = (key: Key) => {
    const nextTab = String(key) as TabId;
    setActiveTab(nextTab);
    window.sessionStorage.setItem(ACTIVE_TAB_KEY, nextTab);
  };

  const navigateToTab = (nextTab: 'live-session' | 'settings') => {
    setActiveTab(nextTab);
    window.sessionStorage.setItem(ACTIVE_TAB_KEY, nextTab);
  };

  return (
    <>
      <PluginHeader title="Pointing Poker" />
      <Container>
        <Tabs onSelectionChange={handleTabChange} selectedKey={activeTab}>
          <TabList>
            <Tab id="overview">Overview</Tab>
            <Tab id="live-session">Live session</Tab>
            <Tab id="history">History</Tab>
            <Tab id="settings">Settings</Tab>
          </TabList>
          <TabPanel id="overview">
            <OverviewTab onNavigate={navigateToTab} />
          </TabPanel>
          <TabPanel id="live-session">
            <LiveSessionTab />
          </TabPanel>
          <TabPanel id="history">
            <HistoryTab />
          </TabPanel>
          <TabPanel id="settings">
            <SettingsTab />
          </TabPanel>
        </Tabs>
      </Container>
    </>
  );
}
