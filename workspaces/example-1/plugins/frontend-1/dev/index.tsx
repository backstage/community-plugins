import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { frontend1Plugin, Frontend1Page } from '../src/plugin';

createDevApp()
  .registerPlugin(frontend1Plugin)
  .addPage({
    element: <Frontend1Page />,
    title: 'Root Page',
    path: '/frontend-1'
  })
  .render();
