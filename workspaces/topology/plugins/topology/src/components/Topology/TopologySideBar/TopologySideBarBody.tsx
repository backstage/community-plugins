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
import type { PropsWithChildren, ChangeEvent } from 'react';

import { useState } from 'react';

import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { BaseNode } from '@patternfly/react-topology';

import { useTranslation } from '../../../hooks/useTranslation';
import TopologyDetailsTabPanel from './TopologyDetailsTabPanel';
import TopologyResourcesTabPanel from './TopologyResourcesTabPanel';

import './TopologySideBarBody.css';

interface TabPanelProps {
  index: number;
  value: number;
}

const TabPanel = (props: PropsWithChildren<TabPanelProps>) => {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <div className="topology-side-bar-tab-panel">{children}</div>
      )}
    </div>
  );
};

type TopologySideBarBodyProps = { node: BaseNode };

const TopologySideBarBody = ({ node }: TopologySideBarBodyProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const handleChange = (_event: ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <div className="topology-side-bar-tabs">
        <Tabs value={value} onChange={handleChange} indicatorColor="primary">
          <Tab label={t('sideBar.details')} className="tab-button" />
          <Tab label={t('sideBar.resources')} className="tab-button" />
        </Tabs>
        <Divider />
      </div>
      <TabPanel value={value} index={0}>
        <TopologyDetailsTabPanel node={node} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TopologyResourcesTabPanel node={node} />
      </TabPanel>
    </div>
  );
};

export default TopologySideBarBody;
