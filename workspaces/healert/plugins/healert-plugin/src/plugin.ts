// Copyright 2026 Healert Inc.
// Licensed under the Apache License, Version 2.0

import React from 'react';
import {
  createFrontendPlugin,
  createApiFactory,
  ApiBlueprint,
  discoveryApiRef,
  fetchApiRef,
  configApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { healertApiRef, HealertClient } from './api';

// =============================================================================
// FEATURE REGISTRY
//
// All Healert features render inside a single "Healert Platform" tab.
// To add a new feature — edit EntityHealertContent.tsx, not this file.
//
// This file only controls the tab itself (path, title).
// The tab content is managed by EntityHealertContent.tsx.
//
// Example of adding a new TAB (separate from Healert Platform):
//
//   {
//     name:   'healert-example',
//     path:   '/example',
//     title:  'Example',
//     loader: async () => {
//       const { ExampleComponent } = await import(
//         './components/ExampleComponent/ExampleComponent'
//       );
//       return React.createElement(ExampleComponent);
//     },
//   },
//
// =============================================================================

const HEALERT_FEATURES = [
  {
    name: 'healert',
    path: '/healert',
    title: 'Healert Platform',
    loader: async () => {
      const { EntityHealertContent } = await import(
        './components/EntityHealertContent/EntityHealertContent'
      );
      return React.createElement(EntityHealertContent);
    },
  },
];

// =============================================================================
// API EXTENSION
// Registers HealertClient into the Backstage DI container.
// Do not edit this section.
// =============================================================================

/** @public */
export const healertApiExtension = ApiBlueprint.make({
  name: 'healert',
  params: define =>
    define(
      createApiFactory({
        api: healertApiRef,
        deps: {
          discoveryApi: discoveryApiRef,
          fetchApi: fetchApiRef,
          configApi: configApiRef,
        },
        factory: ({ discoveryApi, fetchApi, configApi }) =>
          new HealertClient({ discoveryApi, fetchApi, configApi }),
      }),
    ),
});

// =============================================================================
// AUTO-GENERATED EXTENSIONS
// Reads HEALERT_FEATURES and creates one tab per entry automatically.
// Do not edit this section.
// =============================================================================

const featureExtensions = HEALERT_FEATURES.map(feature =>
  EntityContentBlueprint.make({
    name: feature.name,
    params: {
      path: feature.path,
      title: feature.title,
      loader: feature.loader,
    },
  }),
);

// =============================================================================
// PLUGIN
// Registers all extensions with Backstage.
// Do not edit this section.
// =============================================================================

/** @public */
export const healertPlugin = createFrontendPlugin({
  pluginId: 'healert',
  extensions: [healertApiExtension, ...featureExtensions],
});
