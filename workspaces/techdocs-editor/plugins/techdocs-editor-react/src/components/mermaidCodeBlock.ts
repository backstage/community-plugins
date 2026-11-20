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

/**
 * Info string (fenced-code language) that marks a Mermaid diagram, e.g.
 * ```mermaid.
 */
export const MERMAID_LANGUAGE = 'mermaid';

/** CSS class applied to rendered Mermaid containers. */
export const MERMAID_CLASS_NAME = 'mermaid';

/** Attribute used to preserve a diagram's original source for re-theming. */
export const MERMAID_SOURCE_ATTRIBUTE = 'data-mermaid-source';

/**
 * Returns true when a fenced code block's info string denotes a Mermaid
 * diagram, tolerating surrounding whitespace and case (e.g. ` Mermaid `).
 */
export function isMermaidInfo(info: string | undefined | null): boolean {
  return (info ?? '').trim().toLocaleLowerCase('en-US') === MERMAID_LANGUAGE;
}

/**
 * Builds the Toast UI custom-renderer token stream for a Mermaid fence: a
 * `.mermaid` container holding the raw diagram source. The source is also
 * stored (URI-encoded) in {@link MERMAID_SOURCE_ATTRIBUTE} so it can be
 * restored when diagrams are re-rendered for a theme change. The token shape
 * matches Toast UI's `customHTMLRenderer` contract; it is typed loosely
 * because Toast UI does not export the token types.
 */
export function buildMermaidCodeBlockTokens(source: string): unknown[] {
  return [
    {
      type: 'openTag',
      tagName: 'div',
      outerNewLine: true,
      classNames: [MERMAID_CLASS_NAME],
      attributes: {
        [MERMAID_SOURCE_ATTRIBUTE]: encodeURIComponent(source),
      },
    },
    { type: 'text', content: source },
    { type: 'closeTag', tagName: 'div', outerNewLine: true },
  ];
}
