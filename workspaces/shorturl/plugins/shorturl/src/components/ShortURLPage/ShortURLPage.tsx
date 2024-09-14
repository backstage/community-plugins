// code based on https://github.com/shailahir/backstage-plugin-shorturl
import React from 'react';
import { Button, Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { ShortURLList } from './ShortURLList';

export const ShortURLPage = () => (
  <Page themeId="tool">
    <Header title="ShortURL" subtitle="Quickly generate short URLs">
      <HeaderLabel label="Maintainer" value="@backstage-community" />
      <HeaderLabel label="Status" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="URL Shortener">
        <Button color="primary">Create URL</Button>
        {/* <Button color="secondary">Refresh</Button> */}
        <SupportButton>Contact for support</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <ShortURLList />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
