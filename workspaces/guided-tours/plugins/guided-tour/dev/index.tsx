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
} from '@backstage/frontend-plugin-api';
import { Button, Container, Flex, Header, Text } from '@backstage/ui';
import {
  GuidedTourBlueprint,
  useGuidedTour,
} from '@internal/backstage-plugin-guided-tour-react';
import { Link } from 'react-router-dom';
import plugin from '../src';

const DemoPage = () => {
  const replay = useGuidedTour('guided-tour/demo-login');
  return (
    <>
      <Header title="Demo" />
      <Container>
        <Flex direction="column" gap="4">
          <Text data-guided-tour="demo.intro">
            This paragraph is the first target.
          </Text>
          <Link to="/second" data-guided-tour="demo.link">
            Click me to continue the tour on the next page
          </Link>
          <Button onPress={() => replay.start({ force: true })}>
            Replay login tour
          </Button>
        </Flex>
      </Container>
    </>
  );
};

const SecondPage = () => (
  <>
    <Header title="Second" />
    <Container>
      <Text data-guided-tour="second.text">
        You arrived on the second page.
      </Text>
    </Container>
  </>
);

const demoModule = createFrontendModule({
  pluginId: 'guided-tour',
  extensions: [
    PageBlueprint.make({
      name: 'demo',
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
            target: 'demo.intro',
            content: 'This is the **first** target.',
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
            target: 'second.text',
            placement: 'top',
            content: 'Starts on first visit of `/second`.',
          },
        ],
      },
    }),
  ],
});

createDevApp({ features: [plugin, demoModule] });
