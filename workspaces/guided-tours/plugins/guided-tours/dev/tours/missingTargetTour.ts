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
 * Started by hand from the tours page. Its targets do not exist, so it shows
 * the two fallbacks: a centered card after the timeout, and a skipped step.
 */
export const missingTargetTour = GuidedTourBlueprint.make({
  name: 'missing-target',
  params: {
    title: 'A target that never shows up',
    description:
      'What happens when a step points at an element that does not exist.',
    order: 90,
    steps: [
      {
        id: 'intro',
        title: 'Missing targets',
        route: '/',
        content:
          'The next two steps point at elements that are not on this page. ' +
          'Each waits **1.5 seconds** for its target before it falls back.',
      },
      {
        id: 'centered',
        title: 'Shown centered',
        target: { selector: '[data-guided-tour="does-not-exist"]' },
        targetTimeoutMs: 1500,
        content:
          'No element matches `[data-guided-tour="does-not-exist"]`, so this ' +
          'step is shown centered: `onMissingTarget` defaults to `center`.',
      },
      {
        id: 'skipped',
        title: 'Skipped',
        target: { selector: '#also-does-not-exist' },
        targetTimeoutMs: 1500,
        onMissingTarget: 'skip',
        content:
          'You should never read this. The step has `onMissingTarget: skip` ' +
          'and is passed over once its timeout elapses.',
      },
      {
        id: 'done',
        title: 'The end',
        content:
          'Step 3 was skipped after its timeout, which is why the counter ' +
          'jumped from 2 to 4.',
      },
    ],
  },
});
