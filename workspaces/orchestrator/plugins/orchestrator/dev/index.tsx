import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { OrchestratorPage, orchestratorPlugin } from '../src';

createDevApp()
  .registerPlugin(orchestratorPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: <OrchestratorPage />,
    title: 'Root Page',
    path: '/orchestrator',
  })
  .render();
