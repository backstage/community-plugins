import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { linkerdPlugin, LinkerdPage } from '../src/plugin';

createDevApp()
  .registerPlugin(linkerdPlugin)
  .addPage({
    element: <LinkerdPage />,
    title: 'Root Page',
    path: '/linkerd',
  })
  .render();
