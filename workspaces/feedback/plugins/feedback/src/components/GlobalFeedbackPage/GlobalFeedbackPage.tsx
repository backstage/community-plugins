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

import { Content, Header, Page } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import Grid from '@mui/material/Grid';

import { FeedbackDetailsModal } from '../FeedbackDetailsModal';
import { FeedbackTable } from '../FeedbackTable';

export const GlobalFeedbackPage = (props: { themeId?: string }) => {
  const app = useApi(configApiRef);
  const appTitle = app.getString('app.title');
  return (
    <Page themeId={props.themeId ? props.themeId : 'tool'}>
      <Header title="Feedback" subtitle={`on ${appTitle}`} />
      <Content>
        <FeedbackDetailsModal />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FeedbackTable />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
