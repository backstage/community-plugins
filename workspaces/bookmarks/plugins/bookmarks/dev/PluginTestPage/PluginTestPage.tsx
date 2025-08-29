/*
 * Copyright 2025 The Backstage Authors
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

import { Header, Page, TabbedLayout } from '@backstage/core-components';
import { UrlTree } from '../../src/types';
import { StrictMode } from 'react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityBookmarksContent } from '../../src/components/EntityBookmarksContent/EntityBookmarksContent';
import { Entity } from '@backstage/catalog-model';

const testData: UrlTree = {
  'Life story': 'gdoc:1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw', // gdoc defined in app-config.yaml
  'My cool gadgets and gizmos': {
    'fortune cowsay lolcat': 'https://logonoff.co/projects/fcl/index.html',
    'XP tour': 'https://logonoff.co/projects/windowsxptour/index.html',
    notepad: 'https://notepad.logonoff.co',
  },
  'Important documents': {
    'Team sync notes':
      'https://docs.google.com/document/d/1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw/mobilebasic',
    Manifesto: {
      'Agile manifesto':
        'https://docs.google.com/document/d/1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw/mobilebasic',
      'Scrum manifesto':
        'https://docs.google.com/document/d/1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw/mobilebasic',
    },
    'Sprint planning':
      'https://docs.google.com/document/d/1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw/mobilebasic',
  },
};

const testEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { bookmarks: testData, name: 'my-service' },
};

export const PluginTestPage = () => (
  <Page themeId="tool">
    <Header type="component — service" title="Bookmark plugin demo" />
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Bookmarks">
        <EntityProvider entity={testEntity}>
          <StrictMode>
            <EntityBookmarksContent />
          </StrictMode>
        </EntityProvider>
      </TabbedLayout.Route>
    </TabbedLayout>
  </Page>
);
