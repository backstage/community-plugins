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

import { defaultConfluenceCollatorContentParser } from './defaultConfluenceCollatorContentParser';
import type { ConfluenceDocument } from '../client';

describe('defaultConfluenceCollatorContentParser', () => {
  it('strips HTML tags to produce plaintext', () => {
    const doc = {
      body: { storage: { value: '<h1>Hello <em>World</em></h1>' } },
    } as unknown as ConfluenceDocument;

    const text = defaultConfluenceCollatorContentParser(doc);
    expect(text).toBe('Hello World');
  });

  it('returns empty string when storage value is missing', () => {
    const doc = { body: { storage: {} } } as unknown as ConfluenceDocument;
    const text = defaultConfluenceCollatorContentParser(doc);
    expect(text).toBe('');
  });

  it('handles undefined body gracefully', () => {
    const doc = {} as unknown as ConfluenceDocument;
    const text = defaultConfluenceCollatorContentParser(doc);
    expect(text).toBe('');
  });
});
