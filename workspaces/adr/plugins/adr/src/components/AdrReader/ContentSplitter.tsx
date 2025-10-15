/*
 * Copyright 2022 The Backstage Authors
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

import { useMemo } from 'react';
import { MarkdownContent } from '@backstage/core-components';
import { MermaidDiagram } from './MermaidDiagram';

type ContentPart =
  | { type: 'markdown'; content: string; id: string }
  | { type: 'mermaid'; code: string; id: string };

/**
 * Generate a simple hash for stable keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Splits markdown content containing mermaid blocks into an array of parts
 */
export function splitContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/gim;

  let lastIndex = 0;
  let match = mermaidRegex.exec(content);

  while (match !== null) {
    // Add markdown content before this mermaid block
    if (match.index > lastIndex) {
      const markdownContent = content.substring(lastIndex, match.index);
      if (markdownContent.trim()) {
        parts.push({
          type: 'markdown',
          content: markdownContent,
          id: `md-${simpleHash(markdownContent)}`,
        });
      }
    }

    // Add the mermaid block
    const mermaidCode = match[1].trim();
    parts.push({
      type: 'mermaid',
      code: mermaidCode,
      id: `mermaid-${simpleHash(mermaidCode)}`,
    });

    lastIndex = match.index + match[0].length;
    match = mermaidRegex.exec(content);
  }

  // Add remaining markdown content
  if (lastIndex < content.length) {
    const markdownContent = content.substring(lastIndex);
    if (markdownContent.trim()) {
      parts.push({
        type: 'markdown',
        content: markdownContent,
        id: `md-${simpleHash(markdownContent)}`,
      });
    }
  }

  return parts;
}

/**
 * Renders mixed markdown and mermaid content
 */
export const MixedContent = ({
  content,
  linkTarget,
  transformImageUri,
}: {
  content: string;
  linkTarget?: string;
  transformImageUri?: (href: string) => string;
}) => {
  // Memoize parts to avoid re-parsing on every render
  const parts = useMemo(() => splitContent(content), [content]);

  return (
    <>
      {parts.map(part => {
        if (part.type === 'markdown') {
          return (
            <MarkdownContent
              key={part.id}
              content={part.content}
              linkTarget={linkTarget}
              transformImageUri={transformImageUri}
            />
          );
        }
        return <MermaidDiagram key={part.id} code={part.code} />;
      })}
    </>
  );
};
