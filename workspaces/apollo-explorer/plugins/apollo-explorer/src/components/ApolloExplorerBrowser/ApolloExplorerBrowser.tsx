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

import { useState } from 'react';
import { Tabs, TabList, Tab } from '@backstage/ui';
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
  const [tabIndex, setTabIndex] = useState(0);

  const apiHolder = useApiHolder();

  const getAuthCallback = (index: number) => {
    const authCallback = endpoints[index].authCallback;
    if (authCallback === undefined) return undefined;
    return () => authCallback({ apiHolder });
  };

  return (
    <div className={styles.root}>
      <Tabs
        selectedKey={String(tabIndex)}
        onSelectionChange={key => setTabIndex(Number(key))}
      >
        <TabList className={styles.tabs}>
          {endpoints.map(({ title }, index) => (
            <Tab key={index} id={String(index)}>
              {title}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <hr className={styles.divider} />
      <Content className={styles.content}>
        <ApolloExplorer
          className={styles.explorer}
          graphRef={endpoints[tabIndex].graphRef}
          handleRequest={handleAuthRequest({
            authCallback: getAuthCallback(tabIndex),
          })}
          persistExplorerState={endpoints[tabIndex].persistExplorerState}
          initialState={endpoints[tabIndex].initialState}
        />
      </Content>
    </div>
  );
};
