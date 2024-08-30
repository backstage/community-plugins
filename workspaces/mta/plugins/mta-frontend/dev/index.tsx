import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { mtaPlugin, EntityMTAContent} from '../src/plugin';

createDevApp()
  .registerPlugin(mtaPlugin)
  .addPage({
    element: <EntityMTAContent/>,
    title: 'Root Page',
    path: '/mta'
  })
  .render();
