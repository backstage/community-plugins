import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { shorturlPlugin, ShorturlPage } from '../src/plugin';

createDevApp()
  .registerPlugin(shorturlPlugin)
  .addPage({
    element: <ShorturlPage />,
    title: 'Root Page',
    path: '/shorturl',
  })
  .render();
