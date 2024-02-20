import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { exampleFrontendPlugin, ExampleFrontendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(exampleFrontendPlugin)
  .addPage({
    element: <ExampleFrontendPage />,
    title: 'Root Page',
    path: '/example-frontend',
  })
  .render();
