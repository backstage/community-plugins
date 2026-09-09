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
import { Tab, TabList, TabPanel, Tabs, Text } from '@backstage/ui';
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
  const [selectedKey, setSelectedKey] = useState('0');

  if (!endpoints.length) {
    return <Text variant="title-small">No endpoints available</Text>;
  }

  return (
    <div className={styles.root}>
      <Tabs
        selectedKey={selectedKey}
        onSelectionChange={key => setSelectedKey(String(key))}
      >
        <TabList className={styles.tabs}>
          {endpoints.map(({ title }, index) => (
            <Tab key={index} id={String(index)}>
              {title}
            </Tab>
          ))}
        </TabList>
        {endpoints.map(({ id, fetcher, plugins }, index) => {
          const storage = StorageBucket.forLocalStorage(
            `plugin/graphiql/data/${id}`,
          );

          return (
            <TabPanel key={id} id={String(index)} className={styles.tabPanel}>
              <Suspense fallback={<Progress />}>
                <div className={styles.graphiQlWrapper}>
                  <GraphiQL
                    key={id}
                    fetcher={fetcher}
                    storage={storage}
                    plugins={plugins}
                  />
                </div>
              </Suspense>
            </TabPanel>
          );
        })}
      </Tabs>
    </div>
  );
};
