import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { shorturlPlugin, ShortURLPage, ShortURLGo } from '../src/plugin';

createDevApp()
  .registerPlugin(shorturlPlugin)
  .addPage({
    element: <ShortURLPage />,
    title: 'Root Page',
    path: '/shorturl',
  })
  .addPage({
    element: <ShortURLGo />,
    title: 'Short URL Redirect',
    path: '/go/:id',
  })
  .render();
