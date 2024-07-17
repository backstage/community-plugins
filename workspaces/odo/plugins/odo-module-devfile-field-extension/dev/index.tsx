import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  devfileSelectorExtensionPlugin,
  DevfileSelectorFieldExtension,
} from '../src/plugin';

createDevApp()
  .registerPlugin(devfileSelectorExtensionPlugin)
  .addPage({
    element: <DevfileSelectorFieldExtension />,
  })
  .render();
