import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  meeweeTimeRegistrationPlugin,
  MeeweeTimeRegistrationPage,
} from '../src/plugin';

createDevApp()
  .registerPlugin(meeweeTimeRegistrationPlugin)
  .addPage({
    element: <MeeweeTimeRegistrationPage />,
    title: 'Root Page',
    path: '/meewee-time-registration',
  })
  .render();
