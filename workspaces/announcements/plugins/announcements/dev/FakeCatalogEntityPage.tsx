import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';

export const FakeCatalogEntityPage = () => {
  return (
    <Page themeId="home">
      <Header title="FakeCatalogPage" />

      <Content>plop</Content>
    </Page>
  );
};
