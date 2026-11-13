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

/**
 * Started by hand from the tours page. One step has a selector that cannot
 * be parsed, which must neither break the overlay nor the app.
 */
export const invalidSelectorTour = GuidedTourBlueprint.make({
  name: 'invalid-selector',
  params: {
    title: 'An invalid selector',
    description: 'A step whose CSS selector cannot be parsed.',
    order: 91,
    steps: [
      {
        id: 'intro',
        title: 'Invalid selectors',
        route: '/',
        content:
          'The next step has the target `{ selector: "div[" }`, which is not ' +
          'valid CSS.',
      },
      {
        id: 'broken',
        title: 'Broken selector',
        target: { selector: 'div[' },
        content:
          'The selector `div[` cannot be parsed. The step is shown centered ' +
          'right away, without waiting for a timeout, and the mistake is ' +
          'reported to the error API so it shows up as an alert.',
      },
      {
        id: 'done',
        title: 'The end',
        content: 'Previous, Next and Close kept working all the time.',
      },
    ],
  },
});
