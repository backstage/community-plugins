/*
 * Copyright 2025 The Backstage Authors
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

import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import catalogPlugin from '@backstage/plugin-catalog/alpha';

import { entityFeedbackApiRef } from '../../src/api';
import entityFeedbackPlugin from '../../src/alpha';

import { catalogApi } from './catalogApiMock';
import { feedbackApiMock } from './feedbackApiMock';

const catalogPluginOverrides = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

const entityFeedbackPluginOverrides = entityFeedbackPlugin.withOverrides({
  extensions: [
    entityFeedbackPlugin.getExtension('api:entity-feedback').override({
      params: defineParams =>
        defineParams({
          api: entityFeedbackApiRef,
          deps: {},
          factory: () => feedbackApiMock,
        }),
    }),
  ],
});

const app = createApp({
  features: [catalogPluginOverrides, entityFeedbackPluginOverrides],
});

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
