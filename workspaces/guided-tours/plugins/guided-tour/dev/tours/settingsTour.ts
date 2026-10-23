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

/** Starts on the first visit of the settings page. */
export const settingsTour = GuidedTourBlueprint.make({
  name: 'settings',
  params: {
    title: 'Your settings',
    description: 'Profile, theme and the sidebar.',
    autoStart: { route: '/settings' },
    order: 13,
    steps: [
      {
        id: 'profile',
        title: 'Who you are',
        route: '/settings',
        target: { selector: '[data-testid="user-settings-menu"]' },
        placement: 'left',
        content:
          'Your profile comes from the identity you signed in with. The menu ' +
          'behind this button lets you sign out.',
      },
      {
        id: 'theme',
        title: 'Light or dark',
        target: { selector: 'button[value="dark"]' },
        placement: 'bottom',
        content:
          'Pick a theme, or leave it on _Auto_ to follow your operating system.',
      },
      {
        id: 'sidebar',
        title: 'Pin the sidebar',
        target: { selector: 'input[name="pin"]' },
        placement: 'left',
        onMissingTarget: 'center',
        content:
          'Unpin the sidebar to collapse it and gain some room on small screens.',
      },
      {
        id: 'tabs',
        title: 'More settings',
        target: { selector: 'a[href="/settings/feature-flags"]' },
        placement: 'bottom',
        onMissingTarget: 'center',
        content:
          'Authentication providers and feature flags live in the other tabs. ' +
          'That is the end of this tour.',
      },
    ],
  },
});
