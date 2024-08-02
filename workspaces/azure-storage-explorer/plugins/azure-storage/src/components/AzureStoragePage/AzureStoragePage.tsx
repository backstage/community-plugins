import React from 'react';
import { Header, Page } from '@backstage/core-components';
import { AzureStorageContent } from './AzureStorageContent';

export const AzureStoragePage = () => {
  return (
    <Page themeId="tool">
      <Header title="Azure Storage Explorer" />
      <AzureStorageContent />
    </Page>
  );
};
