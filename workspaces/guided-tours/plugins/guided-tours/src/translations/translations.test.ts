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
import { guidedToursMessages } from './ref';
import german from './de';
import spanish from './es';
import french from './fr';
import italian from './it';
import japanese from './ja';

function flatten(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('translations', () => {
  const keys = flatten(guidedToursMessages).sort();
  const placeholders = (text: string) => (text.match(/{{\w+}}/g) ?? []).sort();

  it.each([
    ['de', german],
    ['es', spanish],
    ['fr', french],
    ['it', italian],
    ['ja', japanese],
  ])('%s translates every message with the same placeholders', (_, lang) => {
    const messages = lang.messages as Record<string, string>;
    expect(Object.keys(messages).sort()).toEqual(keys);
    for (const key of keys) {
      const english = key
        .split('.')
        .reduce<any>((m, part) => m[part], guidedToursMessages);
      expect(placeholders(messages[key])).toEqual(placeholders(english));
    }
  });
});
