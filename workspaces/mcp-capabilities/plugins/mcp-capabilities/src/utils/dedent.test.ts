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
import { dedent } from './dedent';

describe('dedent (cleandoc)', () => {
  it('strips the common indent of the body while keeping the first line flush', () => {
    // The docstring case: first line flush at column 0, body indented — a naive
    // common-minimum dedent would compute min=0 and leave the body indented
    // (mis-parsed as a Markdown code block).
    const doc = [
      'Summary line',
      '',
      '    ## Usage',
      '    Do the thing',
      '',
      '    - one',
      '    - two',
      '',
    ].join('\n');

    expect(dedent(doc)).toBe(
      'Summary line\n\n## Usage\nDo the thing\n\n- one\n- two',
    );
  });

  it('removes leading whitespace from the first line', () => {
    expect(dedent('   Leading\n    body')).toBe('Leading\nbody');
  });

  it('expands tabs to spaces before measuring indentation', () => {
    expect(dedent('a\n\t\tb')).toBe('a\nb');
  });
});
