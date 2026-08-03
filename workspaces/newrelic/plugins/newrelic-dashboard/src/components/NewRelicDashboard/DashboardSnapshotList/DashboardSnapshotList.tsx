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

import { useState } from 'react';
import { newRelicDashboardApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { Progress, ErrorPanel } from '@backstage/core-components';
import { DashboardSnapshot } from './DashboardSnapshot';
import { DashboardEntitySummary } from '../../../api/NewRelicDashboardApi';
import { ResultEntity } from '../../../types/DashboardEntity';
import styles from './DashboardSnapshotList.module.css';

// eslint-disable-next-line react/forbid-elements
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value1: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value1, index, ...other } = props;

  return (
    <div
      className={`${styles.tabPanel} ${value1 === index ? styles.active : ''}`}
      role="tabpanel"
      hidden={value1 !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const DashboardSnapshotList = (props: { guid: string }) => {
  const { guid } = props;
  const newRelicDashboardAPI = useApi(newRelicDashboardApiRef);
  const { value, loading, error } = useAsync(async (): Promise<
    DashboardEntitySummary | undefined
  > => {
    const dashboardObject: Promise<DashboardEntitySummary | undefined> =
      newRelicDashboardAPI.getDashboardEntity(guid);
    return dashboardObject;
  }, [guid]);
  const [value1, setValue1] = useState<number>(0);

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel title={error.name} defaultExpanded error={error} />;
  }
  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsWrapper}>
        {value?.getDashboardEntity?.data?.actor.entitySearch.results.entities?.map(
          (Entity: ResultEntity, index: number) => {
            return (
              // eslint-disable-next-line react/forbid-elements
              <button
                key={index}
                className={`${styles.tab} ${
                  value1 === index ? styles.active : ''
                }`}
                onClick={() => setValue1(index)}
                {...a11yProps(index)}
              >
                {Entity.name}
              </button>
            );
          },
        )}
      </div>
      {value?.getDashboardEntity?.data?.actor.entitySearch.results.entities?.map(
        (Entity: ResultEntity, index: number) => {
          return (
            <TabPanel key={index} value1={value1} index={index}>
              <DashboardSnapshot
                name={Entity.name}
                permalink={Entity.permalink}
                guid={Entity.guid}
              />
            </TabPanel>
          );
        },
      )}
    </div>
  );
};
