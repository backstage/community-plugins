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

import { Tabs, TabList, Tab, TabPanel } from '@backstage/ui';
import { ApolloExplorer } from '@apollo/explorer/react';
import { Content } from '@backstage/core-components';
import { HandleRequest } from '@apollo/explorer/src/helpers/postMessageRelayHelpers';
import { EndpointProps } from '../ApolloExplorerPage';
import { useApiHolder } from '@backstage/core-plugin-api';
import styles from './ApolloExplorerBrowser.module.css';

type Props = {
  endpoints: EndpointProps[];
  authCallback?: () => Promise<{ token: string }>;
};

export const handleAuthRequest = ({
  authCallback,
}: {
  authCallback: Props['authCallback'];
}): HandleRequest => {
  const handleRequest: HandleRequest = async (endpointUrl, options) =>
    fetch(endpointUrl, {
      ...options,
      headers: {
        ...options.headers,
        ...(authCallback && {
          Authorization: `Bearer ${(await authCallback()).token}`,
        }),
      },
    });
  return handleRequest;
};

export const ApolloExplorerBrowser = ({ endpoints }: Props) => {
  const apiHolder = useApiHolder();

  const getAuthCallback = (index: number) => {
    const authCallback = endpoints[index].authCallback;
    if (authCallback === undefined) return undefined;
    return () => authCallback({ apiHolder });
  };

  return (
    <div className={styles.root}>
      <Tabs defaultSelectedKey="0">
        <TabList className={styles.tabs}>
          {endpoints.map(({ title }, index) => (
            <Tab key={index} id={String(index)}>
              {title}
            </Tab>
          ))}
        </TabList>
        {endpoints.map((endpoint, index) => (
          <TabPanel key={index} id={String(index)}>
            <Content className={styles.content}>
              <ApolloExplorer
                className={styles.explorer}
                graphRef={endpoint.graphRef}
                handleRequest={handleAuthRequest({
                  authCallback: getAuthCallback(index),
                })}
                persistExplorerState={endpoint.persistExplorerState}
                initialState={endpoint.initialState}
              />
            </Content>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};
