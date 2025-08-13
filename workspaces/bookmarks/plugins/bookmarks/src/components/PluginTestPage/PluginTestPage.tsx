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

import { Header, Page, Content } from '@backstage/core-components';

import { BookmarksViewer } from '../BookmarksViewer/BookmarksViewer';
import { UrlTree } from '../../api/types';
import { StrictMode } from 'react';

const testData: UrlTree = {
  'Life story':
    'https://docs.google.com/document/d/1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw/mobilebasic',
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

export const PluginTestPage = () => (
  <Page themeId="tool">
    <Header title="Bookmark plugin demo" />
    <Content>
      <StrictMode>
        <BookmarksViewer tree={testData} />
      </StrictMode>
    </Content>
  </Page>
);
