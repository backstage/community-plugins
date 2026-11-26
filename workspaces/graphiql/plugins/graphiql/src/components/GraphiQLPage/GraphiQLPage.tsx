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
import { JSX } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import 'graphiql/graphiql.css';
import { graphQlBrowseApiRef } from '../../lib/api';
import { GraphiQLBrowser } from '../GraphiQLBrowser';
import { Container, Header, Text } from '@backstage/ui';
import { Progress } from '@backstage/core-components';

/** @public */
export const GraphiQLPage = () => {
  const graphQlBrowseApi = useApi(graphQlBrowseApiRef);
  const endpoints = useAsync(() => graphQlBrowseApi.getEndpoints());

  let content: JSX.Element;

  if (endpoints.loading) {
    content = (
      <Container>
        <Progress />
      </Container>
    );
  } else if (endpoints.error) {
    content = (
      <Container>
        <Text as="h4" variant="title-large" color="danger">
          {/* TODO: provide a proper error component */}
          Failed to load GraphQL endpoints, {String(endpoints.error)}
        </Text>
      </Container>
    );
  } else {
    content = <GraphiQLBrowser endpoints={endpoints.value!} />;
  }

  return (
    <>
      <Header
        title="GraphiQL"
        metadata={[
          { label: 'Owner', value: 'Spotify' },
          { label: 'Lifecycle', value: 'Alpha' },
        ]}
      />
      {content}
    </>
  );
};
