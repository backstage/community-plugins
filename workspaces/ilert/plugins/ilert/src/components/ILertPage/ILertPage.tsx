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
import { Header, Tab, TabList, Tabs } from '@backstage/ui';
import { useState } from 'react';
import { AlertsPage } from '../AlertsPage';
import { OnCallSchedulesPage } from '../OnCallSchedulesPage';
import { ServicesPage } from '../ServicesPage';
import { StatusPagesPage } from '../StatusPagePage';

/** @public */
export const ILertPage = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const tabs = [
    { label: 'Who is on call?' },
    { label: 'Alerts' },
    { label: 'Services' },
    { label: 'Status pages' },
  ];
  const renderTab = () => {
    switch (selectedTab) {
      case 0:
        return <OnCallSchedulesPage />;
      case 1:
        return <AlertsPage />;
      case 2:
        return <ServicesPage />;
      case 3:
        return <StatusPagesPage />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header
        title="ilert"
        tags={[{ label: 'tool' }]}
        metadata={[
          { label: 'Owner', value: 'ilert' },
          { label: 'Lifecycle', value: 'Alpha' },
        ]}
      />
      <Tabs
        selectedKey={selectedTab.toString()}
        onSelectionChange={key => setSelectedTab(Number(key))}
      >
        <TabList>
          {tabs.map(({ label }, index) => (
            <Tab key={index} id={index.toString()}>
              {label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      {renderTab()}
    </>
  );
};

export default ILertPage;
