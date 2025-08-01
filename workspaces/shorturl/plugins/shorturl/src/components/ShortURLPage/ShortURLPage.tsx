// code based on https://github.com/shailahir/backstage-plugin-shorturl
import React, { useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  HeaderLabel,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { ShortURLCreate, ShortURLList } from '.';

export const ShortURLPage = () => {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleRefresh = async () => {
    setRefreshFlag(!refreshFlag);
  };

  return (
    <Page themeId="tool">
      <Header title="ShortURL" subtitle="Quickly generate short URLs">
        <HeaderLabel label="Maintainer" value="@backstage-community" />
        <HeaderLabel label="Status" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="URL Shortener">
          <Button color="primary" onClick={handleRefresh}>
            Refresh
          </Button>
          <SupportButton>Contact for support</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <ShortURLCreate onCreate={handleRefresh} />
          </Grid>
          <Grid item>
            <ShortURLList refreshFlag={refreshFlag} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
