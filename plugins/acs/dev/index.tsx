import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { acsPlugin, ACSPage } from '../src/plugin';

createDevApp()
  .registerPlugin(acsPlugin)
  .addPage({
    element: <ACSPage />,
    title: 'Root Page',
    path: '/acs',
  })
  .render();
