import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { fooPlugin, FooPage } from '../src/plugin';

createDevApp()
  .registerPlugin(fooPlugin)
  .addPage({
    element: <FooPage />,
    title: 'Root Page',
    path: '/foo'
  })
  .render();
