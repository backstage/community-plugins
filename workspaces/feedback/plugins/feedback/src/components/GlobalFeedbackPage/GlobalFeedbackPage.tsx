import React from 'react';

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
