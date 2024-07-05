import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { azureStoragePlugin, AzureStoragePage } from '../src/plugin';

createDevApp()
  .registerPlugin(azureStoragePlugin)
  .addPage({
    element: <AzureStoragePage />,
    title: 'Root Page',
    path: '/azure-storage',
  })
  .render();
