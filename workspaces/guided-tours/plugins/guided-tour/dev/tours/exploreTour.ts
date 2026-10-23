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

/** A manual tour that only changes pages; started from the tours page. */
export const exploreTour = GuidedTourBlueprint.make({
  name: 'explore',
  params: {
    title: 'Explore the portal',
    description:
      'A manual tour across the home, catalog, create, notifications and settings pages.',
    order: 3,
    steps: [
      {
        id: 'home',
        title: 'Home',
        route: '/home',
        content: 'The home page collects widgets from many plugins.',
      },
      {
        id: 'catalog',
        title: 'The catalog',
        route: '/catalog',
        target: { selector: '[data-testid="user-picker-all"]' },
        placement: 'right',
        content:
          'Filter the catalog by _kind_, _owner_ or _tags_. This dev app uses an in-memory catalog.',
      },
      {
        id: 'create',
        title: 'Create',
        route: '/create',
        content:
          'Software templates live here. The example template comes from the mock catalog.',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        route: '/notifications',
        content:
          'Two of the mock notifications are unread. Mark them as read to see the counter change.',
      },
      {
        id: 'settings',
        title: 'Settings',
        route: '/settings',
        content:
          'Theme, identity and feature flags. That is the end of this tour.',
      },
    ],
  },
});
