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
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import {
  SidebarLanguageSwitcher,
  SidebarSignOutButton,
} from '@backstage/dev-utils';
import { createDevApp } from '@backstage/frontend-dev-utils';
import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { Container, Flex } from '@backstage/ui';

import { RiNpmjsLine } from '@remixicon/react';

import npmPlugin from '../src/alpha';

import { allExamples } from './examples';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  EntityNpmInfoCard,
  EntityNpmReleaseOverviewCard,
  EntityNpmReleaseTableCard,
} from '../src';

const devPages = allExamples.map(example =>
  PageBlueprint.make({
    name: example.metadata.name,
    params: {
      path: `/${example.metadata.name}`,
      title: example.metadata.name,
      icon: <RiNpmjsLine />,
      loader: async () => (
        <EntityProvider entity={example}>
          <Container>
            <Flex direction="column" gap="4" mt="4" mb="4">
              {/* Can we load this more dynamically to verify the NFS extensions loading way? */}
              <EntityNpmInfoCard />
              <EntityNpmReleaseOverviewCard />
              <EntityNpmReleaseTableCard />
            </Flex>
          </Container>
        </EntityProvider>
      ),
    },
  }),
);

const devSidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));
      return (
        <Sidebar>
          <SidebarGroup label="Menu">
            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
              {/* TODO: PageBlueprints are not picked up automatically?! Why? ¯_(ツ)_/¯ */}
              {allExamples.map(example => (
                <SidebarItem
                  key={example.metadata.name}
                  icon={() => <RiNpmjsLine />}
                  to={`/${example.metadata.name}`}
                  text={example.metadata.name}
                />
              ))}
            </SidebarScrollWrapper>
          </SidebarGroup>
          <SidebarSpace />
          <SidebarLanguageSwitcher />
          <SidebarSignOutButton />
        </Sidebar>
      );
    },
  },
});

const devAppModule = createFrontendModule({
  pluginId: 'app',
  extensions: [devSidebarContent, ...devPages],
});

createDevApp({
  features: [devAppModule, npmPlugin],
});
