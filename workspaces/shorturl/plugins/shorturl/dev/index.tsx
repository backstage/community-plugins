import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { shorturlPlugin, ShortURLPage } from '../src/plugin';

createDevApp()
  .registerPlugin(shorturlPlugin)
  .addPage({
    element: <ShortURLPage />,
    title: 'Root Page',
    path: '/shorturl',
  })
  .render();
