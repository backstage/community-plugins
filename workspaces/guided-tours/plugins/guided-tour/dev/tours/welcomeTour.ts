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

/**
 * The welcome tour of `packages/app`, adapted to the dev app: the sidebar
 * here is the default one without `data-guided-tour` ids, so the steps
 * target the sidebar links by href.
 */
export const welcomeTour = GuidedTourBlueprint.make({
  name: 'welcome',
  params: {
    title: 'Welcome to Backstage',
    description:
      'A quick walk through the catalog, templates and your settings.',
    autoStart: 'login',
    order: 1,
    steps: [
      {
        id: 'intro',
        title: 'Welcome 👋',
        content:
          'Backstage is your developer portal: **one place** for all your software, ' +
          'services and documentation. This short tour shows you around.',
      },
      {
        id: 'catalog-nav',
        title: 'The software catalog',
        route: '/catalog',
        target: { selector: 'nav a[href="/catalog"]' },
        placement: 'right',
        content:
          'Everything your organization owns is listed in the catalog: ' +
          'components, APIs, systems and the people behind them.',
      },
      {
        id: 'catalog-page',
        title: 'Browse and filter',
        route: '/catalog',
        target: { selector: '[data-testid="user-picker-all"]' },
        placement: 'right',
        onMissingTarget: 'center',
        content:
          'Filter by _kind_, _type_, _owner_ or _tags_. Star the entities you ' +
          'care about to find them again quickly.',
      },
      {
        id: 'create-nav',
        title: 'Create something new',
        route: '/create',
        target: { selector: 'nav a[href="/create"]' },
        placement: 'right',
        content:
          'Software templates scaffold a new project in minutes, following ' +
          "your organization's best practices.",
      },
      {
        id: 'settings-nav',
        title: 'Your settings',
        route: '/settings',
        target: { selector: 'nav a[href="/settings"]' },
        placement: 'right',
        content:
          'Switch themes, manage your identity and more. ' +
          'Replay any tour from [Guided tours](/guided-tours) at any time.',
      },
    ],
  },
});
