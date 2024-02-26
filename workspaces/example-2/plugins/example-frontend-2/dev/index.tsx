import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { exampleFrontend2Plugin, ExampleFrontend2Page } from '../src/plugin';

createDevApp()
  .registerPlugin(exampleFrontend2Plugin)
  .addPage({
    element: <ExampleFrontend2Page />,
    title: 'Root Page',
    path: '/example-frontend-2',
  })
  .render();
