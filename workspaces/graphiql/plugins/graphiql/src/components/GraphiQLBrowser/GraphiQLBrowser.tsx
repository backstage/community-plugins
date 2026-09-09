/*
 * Copyright 2020 The Backstage Authors
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

import { lazy, useState, Suspense } from 'react';
import { Tabs, TabList, Tab, TabPanel, Text } from '@backstage/ui';
import 'graphiql/graphiql.css';
import { StorageBucket } from '../../lib/storage';
import { GraphQLEndpoint } from '../../lib/api';
import { Progress } from '@backstage/core-components';
import styles from './GraphiQLBrowser.module.css';

const GraphiQL = lazy(() =>
  import('graphiql').then(m => ({ default: m.GraphiQL })),
);

type GraphiQLBrowserProps = {
  endpoints: GraphQLEndpoint[];
};

export const GraphiQLBrowser = (props: GraphiQLBrowserProps) => {
  const { endpoints } = props;

  const [tabId, setTabId] = useState<string>('0');

  if (!endpoints.length) {
    return <Text variant="title-large">No endpoints available</Text>;
  }

  const tabIndex = Number(tabId);
  const { id, fetcher, plugins } = endpoints[tabIndex];
  const storage = StorageBucket.forLocalStorage(`plugin/graphiql/data/${id}`);

  return (
    <div className={styles.root}>
      <Suspense fallback={<Progress />}>
        <Tabs
          selectedKey={tabId}
          onSelectionChange={key => setTabId(String(key))}
        >
          <TabList className={styles.tabs}>
            {endpoints.map(({ title }, index) => (
              <Tab key={index} id={String(index)}>
                {title}
              </Tab>
            ))}
          </TabList>
          {endpoints.map((_, index) => (
            <TabPanel key={index} id={String(index)}>
              <div className={styles.graphiQlWrapper}>
                <GraphiQL
                  key={index}
                  fetcher={fetcher}
                  storage={storage}
                  plugins={plugins}
                />
              </div>
            </TabPanel>
          ))}
        </Tabs>
      </Suspense>
    </div>
  );
};
