import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { mockEntity } from '../src/mocks';
import {
  EntityFeedbackPage,
  feedbackPlugin,
  GlobalFeedbackPage,
  OpcFeedbackComponent,
} from '../src/plugin';

createDevApp()
  .registerPlugin(feedbackPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: (
      <>
        <GlobalFeedbackPage /> <OpcFeedbackComponent />
      </>
    ),
    title: 'Root Page',
    path: '/feedback',
  })
  .addPage({
    element: (
      <div style={{ padding: '1rem' }}>
        <EntityProvider entity={mockEntity}>
          <EntityFeedbackPage />
        </EntityProvider>
        <OpcFeedbackComponent />
      </div>
    ),
    title: 'Entity Page',
    path: '/catalog/default/component/example-website-for-feedback-plugin',
  })
  .render();
