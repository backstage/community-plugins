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

import { UrlTree } from '../src/types';
import { Entity } from '@backstage/catalog-model';

export const testData: UrlTree = {
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

export const testEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    bookmarks: testData,
    description: 'Has a bookmarks object in the metadata',
    name: 'bookmarks',
    tags: ['bookmarks'],
  },
};

export const testEntityNoBookmarks: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'no-bookmarks',
    description: 'No bookmarks object in the metadata',
    tags: ['bookmarks'],
  },
};

export const testEntityInvalidBookmarks: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'invalid-bookmarks',
    description: 'Has a number as a URL',
    bookmarks: { a: 123 },
    tags: ['bookmarks', 'invalid'],
  },
};

export const testEntities: Entity[] = [
  testEntity,
  testEntityNoBookmarks,
  testEntityInvalidBookmarks,
];
