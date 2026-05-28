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
import { useState } from 'react';

import { Tab, TabList, TabPanel, Tabs } from '@backstage/ui';
import { BaseNode } from '@patternfly/react-topology';

import { useTranslation } from '../../../hooks/useTranslation';
import TopologyDetailsTabPanel from './TopologyDetailsTabPanel';
import TopologyResourcesTabPanel from './TopologyResourcesTabPanel';

import './TopologySideBarBody.css';
import styles from './TopologySideBarContent.module.css';

type TopologySideBarBodyProps = { node: BaseNode };

const TopologySideBarBody = ({ node }: TopologySideBarBodyProps) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('details');

  return (
    <div>
      <div className="topology-side-bar-tabs">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={key => setSelectedTab(String(key))}
        >
          <TabList>
            <Tab id="details" className="tab-button">
              {t('sideBar.details')}
            </Tab>
            <Tab id="resources" className="tab-button">
              {t('sideBar.resources')}
            </Tab>
          </TabList>
          <hr className={styles.divider} />
          <TabPanel id="details">
            <div className="topology-side-bar-tab-panel">
              <TopologyDetailsTabPanel node={node} />
            </div>
          </TabPanel>
          <TabPanel id="resources">
            <div className="topology-side-bar-tab-panel">
              <TopologyResourcesTabPanel node={node} />
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default TopologySideBarBody;
