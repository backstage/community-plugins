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
import { createDevApp } from '@backstage/frontend-dev-utils';
import {
  createFrontendModule,
  PageBlueprint,
  PluginHeaderActionBlueprint,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { Button, Container, Flex, Header, Text } from '@backstage/ui';
import {
  GuidedTourBlueprint,
  MarkdownText,
  RestartTourAction,
  useGuidedTour,
} from '@internal/backstage-plugin-guided-tour-react';
import { Link } from 'react-router-dom';
import plugin from '../src';
import {
  catalogMockModule,
  notificationsMockModule,
  scaffolderMockModule,
} from './mockApis';

const DemoPage = () => {
  const replay = useGuidedTour('guided-tour/demo-login');
  return (
    <>
      <Header title="Demo" />
      <Container>
        <Flex direction="column" gap="4" align="start">
          <Text data-guided-tour="demo.intro">
            This paragraph is the first target.
          </Text>
          <Link to="/second" data-guided-tour="demo.link">
            Click me to continue the tour on the next page
          </Link>
          <Button onPress={() => replay.start({ force: true })}>
            Replay login tour
          </Button>
          <MarkdownText
            content={
              'Other pages in this dev app: [Home](/home), [Catalog](/catalog), ' +
              '[Create](/create), [Notifications](/notifications), [Settings](/settings) ' +
              'and [Guided tours](/guided-tours).'
            }
          />
        </Flex>
      </Container>
    </>
  );
};

const SecondPage = () => (
  <>
    <Header title="Second" />
    <Container>
      <Flex direction="column" gap="4" align="start">
        <Text data-guided-tour="second.text">
          You arrived on the second page.
        </Text>
        <Link to="/">Back to the demo page</Link>
      </Flex>
    </Container>
  </>
);

const demoModule = createFrontendModule({
  pluginId: 'guided-tour',
  extensions: [
    PageBlueprint.make({
      name: 'demo',
      // no routeRef: route refs can only be declared by the plugin itself, so
      // the demo pages get no sidebar entry and are linked from the pages
      params: { path: '/', title: 'Demo', loader: async () => <DemoPage /> },
    }),
    PageBlueprint.make({
      name: 'second',
      params: {
        path: '/second',
        title: 'Second',
        loader: async () => <SecondPage />,
      },
    }),
    // the header action from the react library, shown on all guided-tour pages
    PluginHeaderActionBlueprint.make({
      name: 'restart-demo-tour',
      params: {
        loader: async () => (
          <RestartTourAction tourId="guided-tour/demo-login" />
        ),
      },
    }),
    GuidedTourBlueprint.make({
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
    }),
    GuidedTourBlueprint.make({
      name: 'demo-route',
      params: {
        title: 'Second page tour',
        autoStart: { route: '/second' },
        steps: [
          {
            id: 'text',
            route: '/second',
            target: 'second.text',
            placement: 'top',
            content: 'Starts on first visit of `/second`.',
          },
        ],
      },
    }),
    GuidedTourBlueprint.make({
      name: 'explore',
      params: {
        title: 'Explore the portal',
        description:
          'A manual tour across the home, catalog, create, notifications and settings pages.',
        order: 2,
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
    }),
  ],
});

const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [
    HomePageWidgetBlueprint.make({
      name: 'welcome',
      params: {
        name: 'GuidedTourWelcome',
        title: 'Guided tour demo',
        description: 'Where to find things in this dev app',
        components: async () => ({
          Content: () => (
            <MarkdownText
              content={
                'This home page is part of the guided tour dev app. ' +
                'Start the **Explore the portal** tour from [Guided tours](/guided-tours).'
              }
            />
          ),
        }),
      },
    }),
  ],
});

createDevApp({
  features: [
    plugin,
    demoModule,
    homePlugin,
    homeModule,
    catalogPlugin,
    catalogMockModule,
    scaffolderPlugin,
    scaffolderMockModule,
    notificationsPlugin,
    notificationsMockModule,
    userSettingsPlugin,
  ],
});
