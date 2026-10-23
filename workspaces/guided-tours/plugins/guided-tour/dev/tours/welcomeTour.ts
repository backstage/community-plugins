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
    completeRoute: '/',
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
        id: 'notifications-nav',
        title: 'Notifications',
        route: '/notifications',
        target: { selector: 'nav a[href="/notifications"]' },
        placement: 'right',
        content:
          'Plugins and people reach you here: finished template runs, ' +
          'ownership changes, announcements.',
      },
      {
        id: 'settings-nav',
        title: 'Your settings',
        route: '/settings',
        target: { selector: 'nav a[href="/settings"]' },
        placement: 'right',
        content: 'Switch themes, manage your identity and more.',
      },
      {
        id: 'guided-tours-nav',
        title: 'Guided tours',
        route: '/guided-tours',
        target: { selector: 'nav a[href="/guided-tours"]' },
        placement: 'right',
        content:
          'Every tour, including this one, can be replayed from here at any ' +
          'time. Done takes you back to the start page.',
      },
    ],
  },
});
