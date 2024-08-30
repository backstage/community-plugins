import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { blackduckPlugin, BlackDuckPage } from '../src/plugin';

createDevApp()
  .registerPlugin(blackduckPlugin)
  .addPage({
    element: <BlackDuckPage />,
    title: 'Root Page',
    path: '/blackduck',
  })
  .render();
