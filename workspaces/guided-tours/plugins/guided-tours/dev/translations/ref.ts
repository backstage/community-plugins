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
import { createTranslationRef } from '@backstage/frontend-plugin-api';

/** Messages of the dev app's catalog tour, to demo translated steps. */
export const devTranslationRef = createTranslationRef({
  id: 'guided-tours-dev',
  messages: {
    catalogTour: {
      title: 'The software catalog',
      description: 'Filters, the entity table and search on the catalog page.',
      kind: {
        title: 'Pick a kind',
        content:
          'The catalog holds more than components: switch the **kind** to see ' +
          'APIs, systems, users, groups or templates.',
      },
      personal: {
        title: 'Yours, starred, or everything',
        content:
          '_Owned_ shows what your groups own, _Starred_ your favourites and ' +
          '_All_ the whole company.',
      },
    },
  },
});
