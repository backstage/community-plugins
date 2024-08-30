import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  resourceOptimizationPlugin,
  ResourceOptimizationPage,
} from '../src/plugin';
import { ResourceOptimizationIconOutlined } from '../src/components/resource-optimization-icon/ResourceOptimizationIconOutlined';

createDevApp()
  .registerPlugin(resourceOptimizationPlugin)
  .addPage({
    title: 'Optimizations',
    path: '/redhat-resource-optimization',
    element: <ResourceOptimizationPage />,
    icon: ResourceOptimizationIconOutlined,
  })
  .render();
