import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { acsPlugin, AcsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(acsPlugin)
  .addPage({
    element: <AcsPage />,
    title: 'Root Page',
    path: '/acs',
  })
  .render();
