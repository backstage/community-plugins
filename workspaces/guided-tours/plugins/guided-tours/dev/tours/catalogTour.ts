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
import { GuidedTourBlueprint } from '@backstage-community/plugin-guided-tours-react';

/** Starts on the first visit of the catalog. */
export const catalogTour = GuidedTourBlueprint.make({
  name: 'catalog',
  params: {
    title: 'The software catalog',
    description: 'Filters, the entity table and search on the catalog page.',
    autoStart: { route: '/catalog' },
    order: 10,
    steps: [
      {
        id: 'kind',
        title: 'Pick a kind',
        route: '/catalog',
        target: { selector: '[data-testid="select"]' },
        placement: 'right',
        content:
          'The catalog holds more than components: switch the **kind** to see ' +
          'APIs, systems, users, groups or templates.',
      },
      {
        id: 'personal',
        title: 'Yours, starred, or everything',
        // the Personal + Company block of the user list picker
        target: { selector: '[class*="CatalogReactUserListPicker-root"]' },
        placement: 'right',
        content:
          '_Owned_ shows what your groups own, _Starred_ your favourites and ' +
          '_All_ the whole company.',
      },
      {
        id: 'table',
        title: 'The entity table',
        target: { selector: 'table' },
        placement: 'top',
        content:
          'Each row is an entity. Click a name to open its page, or star it ' +
          'with the icon in front of the name.',
      },
    ],
  },
});
