/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { mockEntity } from '../src/mocks';
import {
  EntityFeedbackPage,
  feedbackPlugin,
  GlobalFeedbackPage,
  OpcFeedbackComponent,
} from '../src/plugin';

createDevApp()
  .registerPlugin(feedbackPlugin)
  .addThemes(getAllThemes())
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
