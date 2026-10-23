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

/** Starts on the first visit of /create and clicks through to a template. */
export const scaffolderTour = GuidedTourBlueprint.make({
  name: 'scaffolder',
  params: {
    title: 'Create from a template',
    description: 'Finding a template, starting it and following its tasks.',
    autoStart: { route: '/create' },
    order: 11,
    steps: [
      {
        id: 'search',
        title: 'Find a template',
        route: '/create',
        target: { selector: 'input[placeholder="Search"]' },
        placement: 'bottom',
        content:
          'Search templates by name, or filter them by category and owner.',
      },
      {
        id: 'card',
        title: 'A template',
        // the whole card, not only its content
        target: {
          selector: '.MuiCard-root:has([data-testid="template-card-content"])',
        },
        placement: 'right',
        content:
          'Each card is a template from the catalog with its type, tags and owner.',
      },
      {
        id: 'choose',
        title: 'Start it',
        target: { selector: '[data-testid="template-card-actions--create"]' },
        advanceOn: 'click',
        content: 'Click **Choose** to open the template form.',
      },
      {
        id: 'form',
        title: 'Fill in the form',
        route: '/create/templates/default/example-nodejs-template',
        target: { selector: 'form' },
        placement: 'top',
        onMissingTarget: 'center',
        content:
          'The form is generated from the template parameters. Running it ' +
          'needs a backend, which this dev app does not have.',
      },
      {
        id: 'tasks',
        title: 'Follow your runs',
        route: '/create/tasks',
        target: { selector: '[role="tab"][href="/create/tasks"]' },
        placement: 'bottom',
        content:
          'Every template run becomes a task with live logs. ' +
          'This list is empty in the dev app.',
      },
    ],
  },
});
