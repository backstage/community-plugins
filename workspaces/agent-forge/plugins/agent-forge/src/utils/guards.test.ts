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
import { isAnswer, isEmpty, isSuggestions } from './guards';

describe('ChatAssistant Utils', () => {
  describe('isAnswer', () => {
    test.each([
      [true, 'answer', undefined],
      [true, 'answer', []],
      [false, undefined, ['answer']],
      [false, '', undefined],
    ])(
      'should return %s if response has answer of %s and %s suggestions',
      (result, answer, suggestions) => {
        const response = { answer, suggestions };
        expect(isAnswer(response)).toEqual(result);
      },
    );
  });

  describe('isSuggestions', () => {
    test.each([
      [false, '', ['answer']],
      [false, '', undefined],
      [false, 'answer', []],
      [false, 'answer', undefined],
      [false, undefined, ['answer']],
      [true, 'answer', ['answer']],
    ])(
      'should return %s if response has answer %s and %s suggestions',
      (result, answer, suggestions) => {
        const response = { answer, suggestions };
        expect(isSuggestions(response)).toEqual(result);
      },
    );
  });

  describe('isEmpty', () => {
    test.each([
      [false, '', ['answer']],
      [false, 'answer', ['answer']],
      [false, 'answer', []],
      [false, 'answer', undefined],
      [false, undefined, ['answer']],
      [true, '', undefined],
      [true, undefined, []],
      [true, undefined, undefined],
    ])(
      'should return %s if response has answer %s and %s suggestions',
      (result, answer, suggestions) => {
        const response = { answer, suggestions };
        expect(isEmpty(response)).toEqual(result);
      },
    );
  });
});
