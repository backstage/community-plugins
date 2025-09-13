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

import { defaultConfluenceCollatorDocumentTransformer } from './defaultConfluenceCollatorDocumentTransformer';
import type { IndexableConfluenceDocument } from './ConfluenceCollatorFactory';
import type { ConfluenceDocument } from '../client';

describe('defaultConfluenceCollatorDocumentTransformer', () => {
  it('returns an empty object by default', () => {
    const baseDoc = {
      title: 't',
      text: 'x',
      location: 'l',
      spaceKey: 'S',
      spaceName: 'Space',
      ancestors: [],
      lastModified: '2020-01-01',
      lastModifiedFriendly: 'yesterday',
      lastModifiedBy: 'me',
    } as IndexableConfluenceDocument;

    const raw = {
      body: { storage: { value: '<p>x</p>' } },
      space: { key: 'S', name: 'Space', _links: { webui: '/s' } },
      _links: { webui: '/p' },
      type: 'page',
      version: {
        when: '2020-01-01',
        friendlyWhen: 'yesterday',
        by: { publicName: 'me' },
      },
      ancestors: [],
      title: 't',
      status: 'current',
      id: '1',
    } as unknown as ConfluenceDocument;

    const result = defaultConfluenceCollatorDocumentTransformer(baseDoc, raw);
    expect(result).toEqual({});
  });
});
