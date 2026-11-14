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

import {
  MERMAID_CLASS_NAME,
  MERMAID_SOURCE_ATTRIBUTE,
  buildMermaidCodeBlockTokens,
  isMermaidInfo,
} from './mermaidCodeBlock';

describe('mermaidCodeBlock', () => {
  it('detects the mermaid language regardless of case or whitespace', () => {
    expect(isMermaidInfo('mermaid')).toBe(true);
    expect(isMermaidInfo('  Mermaid ')).toBe(true);
    expect(isMermaidInfo('js')).toBe(false);
    expect(isMermaidInfo('')).toBe(false);
    expect(isMermaidInfo(undefined)).toBe(false);
  });

  it('emits a .mermaid container carrying the raw source as text and as a restorable attribute', () => {
    const source = 'graph TD;\n  A-->B & C;';
    const [openTag, textNode, closeTag] = buildMermaidCodeBlockTokens(
      source,
    ) as any[];

    expect(openTag).toMatchObject({
      type: 'openTag',
      tagName: 'div',
      classNames: [MERMAID_CLASS_NAME],
    });
    // Source is URI-encoded in the attribute so a re-theme pass can restore it,
    // and decodes back to the exact original (including newlines and `&`).
    const encoded = openTag.attributes[MERMAID_SOURCE_ATTRIBUTE];
    expect(decodeURIComponent(encoded)).toBe(source);

    expect(textNode).toEqual({ type: 'text', content: source });
    expect(closeTag).toMatchObject({ type: 'closeTag', tagName: 'div' });
  });
});
