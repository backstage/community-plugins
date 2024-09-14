// code based on https://github.com/shailahir/backstage-plugin-shorturl
import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { ShortURLCreate, ShortURLList } from '.';

export const ShortURLPage = () => {
  // const handleRefresh = async () => {
  //   const newShortUrl = 'https://example.com/short-url';
  // };

  return (
    <Page themeId="tool">
      <Header title="ShortURL" subtitle="Quickly generate short URLs">
        <HeaderLabel label="Maintainer" value="@backstage-community" />
        <HeaderLabel label="Status" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="URL Shortener">
          {/* <Button color="primary" onClick={handleRefresh}>Refresh</Button>*/}
          <SupportButton>Contact for support</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <ShortURLCreate />
          </Grid>
          <Grid item>
            <ShortURLList />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
