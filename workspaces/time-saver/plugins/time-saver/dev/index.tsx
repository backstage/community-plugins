import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { TimeSaverPlugin, TimeSaverPage } from '../src/plugin';

createDevApp()
  .registerPlugin(TimeSaverPlugin)
  .addPage({
    element: <TimeSaverPage />,
    title: 'Root Page',
    path: '/time-saver',
  })
  .render();
