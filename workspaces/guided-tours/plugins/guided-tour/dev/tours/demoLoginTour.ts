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
import { GuidedTourBlueprint } from '@internal/backstage-plugin-guided-tour-react';

/** Starts on login, shows markdown, a click-through step and a page change. */
export const demoLoginTour = GuidedTourBlueprint.make({
  name: 'demo-login',
  params: {
    title: 'Welcome to the demo',
    description: 'Starts on login and crosses pages.',
    autoStart: 'login',
    order: 1,
    steps: [
      {
        id: 'intro',
        route: '/',
        target: 'demo.intro',
        content:
          'This is the **first** target. Markdown works here:\n\n' +
          '- bullet lists\n- `inline code`\n- [links](/guided-tours)\n\n' +
          '1. and numbered lists',
      },
      {
        id: 'link',
        target: 'demo.link',
        advanceOn: 'click',
        content: 'Click this link to continue on the next page.',
      },
      {
        id: 'second',
        target: 'second.text',
        content: 'You made it across pages!',
      },
      {
        id: 'done',
        content: 'Done. Replay it from [Guided tours](/guided-tours).',
      },
    ],
  },
});
