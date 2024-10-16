import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { plugin, Page } from '../src/plugin';

createDevApp()
  .registerPlugin(plugin)
  .addPage({
    element: <Page />,
    title: 'Mend Page',
    path: '/mend',
  })
  .render();
