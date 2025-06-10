/*
 * Copyright 2024 The Backstage Authors
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
import { capitalizeFirstLetter } from './string-utils';

describe('capitalizeFirstLetter', () => {
  it('capitalizes the first letter of a lowercase word', () => {
    expect(capitalizeFirstLetter('edit')).toBe('Edit');
    expect(capitalizeFirstLetter('delete')).toBe('Delete');
  });

  it('returns the same word if first letter is already capitalized', () => {
    expect(capitalizeFirstLetter('Update')).toBe('Update');
  });

  it('handles single character strings', () => {
    expect(capitalizeFirstLetter('e')).toBe('E');
  });

  it('returns empty string if input is empty', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('handles non-alphabetic characters', () => {
    expect(capitalizeFirstLetter('1test')).toBe('1test');
    expect(capitalizeFirstLetter('@word')).toBe('@word');
  });
});
