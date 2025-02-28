import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { kenerStatusPlugin, KenerStatusPage } from '../src/plugin';

createDevApp()
  .registerPlugin(kenerStatusPlugin)
  .addPage({
    element: <KenerStatusPage />,
    title: 'Root Page',
    path: '/kener-status',
  })
  .render();
