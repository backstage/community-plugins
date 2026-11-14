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
import { highlightLines } from './Highlighter';

describe('highlightLines', () => {
  it('should highlight supported languages', () => {
    const [line] = highlightLines('go', ['package main']);
    expect(line).toContain('<span class="hljs-keyword">package</span>');
  });

  it('should return escaped plain text for unsupported languages', () => {
    const lines = ['package authz', 'allow if input.a < 1 && "<img src=x>"'];
    expect(() => highlightLines('rego', lines)).not.toThrow();
    expect(highlightLines('rego', lines)).toEqual([
      'package authz',
      'allow if input.a &lt; 1 &amp;&amp; &quot;&lt;img src=x&gt;&quot;',
    ]);
  });
});
