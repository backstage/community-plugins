/*
 * Copyright 2023 The Backstage Authors
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

import {
  GraphQLVoyagerEndpoint,
  introspectionQuery,
} from '../../lib/api/types';
import { Suspense, useState } from 'react';
import { Box, Tab, TabList, TabPanel, Tabs, Text } from '@backstage/ui';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { Voyager } from 'graphql-voyager';
import useAsync from 'react-use/esm/useAsync';
import styles from './GraphQLVoyagerBrowser.module.css';

type GraphQLVoyagerBrowserProps = {
  endpoints: GraphQLVoyagerEndpoint[];
};

const NoEndpoints = () => {
  return (
    <Text as="h4" variant="title-large">
      No endpoints available
    </Text>
  );
};

const VoyagerBrowserContent = ({
  endpoint,
}: {
  endpoint: GraphQLVoyagerEndpoint;
}) => {
  const { id, introspection, introspectionErrorMessage, voyagerProps } =
    endpoint;
  const { value, loading, error } = useAsync(
    () => introspection(introspectionQuery),
    // Depend on id so a stable endpoint identity does not re-trigger the fetch.
    [id, introspection],
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ErrorPanel error={error} />;
  }
  return value.data ? (
    <Voyager key={id} introspection={value} {...voyagerProps} />
  ) : (
    <Text as="h4" variant="title-large" color="danger">
      {introspectionErrorMessage}
    </Text>
  );
};

const VoyagerBrowser = (props: GraphQLVoyagerBrowserProps) => {
  const { endpoints } = props;
  const [tabId, setTabId] = useState('0');

  return (
    <div className={styles.root}>
      <Suspense fallback={<Progress />}>
        <Tabs
          selectedKey={tabId}
          onSelectionChange={key => setTabId(String(key))}
        >
          <TabList className={styles.tabs}>
            {endpoints.map(({ title, id }, index) => (
              <Tab key={id} id={String(index)}>
                {title}
              </Tab>
            ))}
          </TabList>
          {endpoints.map((endpoint, index) => (
            <TabPanel
              key={endpoint.id}
              id={String(index)}
              // Keep panels mounted so switching tabs does not re-run
              // introspection or remount Voyager (avoids a loading flash).
              shouldForceMount
              className={styles.tabPanel}
            >
              <Box>
                <VoyagerBrowserContent endpoint={endpoint} />
              </Box>
            </TabPanel>
          ))}
        </Tabs>
      </Suspense>
    </div>
  );
};

/** @public */
export const GraphQLVoyagerBrowser = (props: GraphQLVoyagerBrowserProps) => {
  const hasEndpoints = checkEndpoints(props);

  if (!hasEndpoints) {
    return <NoEndpoints />;
  }
  return <VoyagerBrowser {...props} />;
};

function checkEndpoints(props: GraphQLVoyagerBrowserProps) {
  return props.endpoints.length;
}
