/*
 * Copyright 2026 The Backstage Authors
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
import { Divider, Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { MTAApplicationManager } from '../MTAApplicationManager/MTAApplicationManager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      throwOnError: false,
    },
  },
});

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <Page themeId="tool">
      <Header title="Application Modernization and Migration Info" />
      <Content>
        <ContentHeader title="MTA Quick Overview">
          <SupportButton>
            A comprehensive view of the MTA workflow integrated within RHDH.
          </SupportButton>
        </ContentHeader>
        <Divider style={{ margin: '20px 0' }} />
        <Grid
          container
          spacing={2}
          direction="column"
          alignItems="center"
          style={{ width: '100%' }}
        >
          <MTAApplicationManager />
        </Grid>
      </Content>
    </Page>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
