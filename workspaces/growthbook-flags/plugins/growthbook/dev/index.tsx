import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { growthbookFlagsPlugin, EntityGrowthbookFlagsContent } from '../src';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Component',
  metadata: {
    name: 'example-website',
    annotations: {
      'growthbook.io/enabled': 'true',
      'growthbook.io/env': 'prod',
    },
  },
  spec: {
    type: 'website',
    lifecycle: 'experimental',
    owner: 'guests',
  },
};

createDevApp()
  .registerPlugin(growthbookFlagsPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityGrowthbookFlagsContent />
      </EntityProvider>
    ),
    title: 'GrowthBook Flags',
    path: '/growthbook-flags',
  })
  .render();
