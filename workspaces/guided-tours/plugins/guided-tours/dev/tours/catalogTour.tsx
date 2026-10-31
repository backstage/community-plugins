/*
 * Copyright 2026 The Backstage Authors
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
import {
  GuidedTourBlueprint,
  translated,
} from '@backstage-community/plugin-guided-tours-react';
import { devTranslationRef } from '../translations';

/**
 * Starts on the first visit of the catalog. Its title, description and
 * first two steps take their texts from a translation ref; the keys are
 * type checked.
 */
export const catalogTour = GuidedTourBlueprint.make({
  name: 'catalog',
  params: {
    title: translated(devTranslationRef, 'catalogTour.title'),
    description: translated(devTranslationRef, 'catalogTour.description'),
    autoStart: { path: '/catalog' },
    order: 10,
    steps: [
      {
        id: 'kind',
        title: translated(devTranslationRef, 'catalogTour.kind.title'),
        route: '/catalog',
        target: { selector: '[data-testid="select"]' },
        placement: 'right',
        content: translated(devTranslationRef, 'catalogTour.kind.content'),
      },
      {
        id: 'personal',
        title: translated(devTranslationRef, 'catalogTour.personal.title'),
        // the Personal + Company block of the user list picker
        target: { selector: '[class*="CatalogReactUserListPicker-root"]' },
        placement: 'right',
        content: translated(devTranslationRef, 'catalogTour.personal.content'),
      },
      {
        id: 'table',
        title: 'The entity table',
        target: { selector: 'table' },
        placement: 'top',
        // a lazily loaded React component instead of markdown
        content: {
          loader: () =>
            import('../components/CatalogHint').then(m => <m.CatalogHint />),
        },
      },
    ],
  },
});
