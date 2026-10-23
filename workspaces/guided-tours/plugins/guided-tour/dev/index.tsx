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
import { devTours } from './tours';

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
    ...devTours,
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
