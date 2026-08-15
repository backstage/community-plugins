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
import { Fragment, ReactNode } from 'react';
import { Link, Text } from '@backstage/ui';

const INLINE = /(\*\*[^*]+\*\*|_[^_]+_|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

const renderInline = (text: string): ReactNode[] =>
  text.split(INLINE).map((part, i) => {
    if (!part) {
      return null;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <s key={i}>{part.slice(2, -2)}</s>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            backgroundColor: 'var(--bui-bg-neutral-2)',
            borderRadius: 'var(--bui-radius-2)',
            fontFamily: 'var(--bui-font-monospace)',
            padding: '0 var(--bui-space-1)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <Link key={i} href={link[2]}>
          {link[1]}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });

export const Markdown = ({ text }: { text?: string }) => {
  if (!text?.trim()) {
    return null;
  }

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let ordered: string[] = [];
  let quote: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }
    const current = paragraph;
    blocks.push(
      <Text
        key={blocks.length}
        as="p"
        variant="body-medium"
        style={{ lineHeight: 1.55, margin: '0 0 var(--bui-space-3)' }}
      >
        {current.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(line)}
          </Fragment>
        ))}
      </Text>,
    );
    paragraph = [];
  };

  const flushBullets = () => {
    if (bullets.length === 0) {
      return;
    }
    const current = bullets;
    blocks.push(
      <ul
        key={blocks.length}
        style={{
          margin: 'var(--bui-space-2) 0',
          paddingLeft: 'var(--bui-space-5)',
        }}
      >
        {current.map((item, i) => (
          <li key={i}>
            <Text as="span" variant="body-medium">
              {renderInline(item)}
            </Text>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  const flushOrdered = () => {
    if (ordered.length === 0) {
      return;
    }
    const current = ordered;
    blocks.push(
      <ol
        key={blocks.length}
        style={{
          margin: 'var(--bui-space-2) 0',
          paddingLeft: 'var(--bui-space-5)',
        }}
      >
        {current.map((item, i) => (
          <li key={i}>
            <Text as="span" variant="body-medium">
              {renderInline(item)}
            </Text>
          </li>
        ))}
      </ol>,
    );
    ordered = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) {
      return;
    }
    const current = quote;
    blocks.push(
      <blockquote
        key={blocks.length}
        style={{
          background: 'var(--bui-bg-info)',
          borderLeft: '3px solid var(--bui-border-info)',
          borderRadius: 'var(--bui-radius-2)',
          margin: 'var(--bui-space-3) 0',
          padding: 'var(--bui-space-3) var(--bui-space-4)',
        }}
      >
        {current.map((line, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {renderInline(line)}
          </Fragment>
        ))}
      </blockquote>,
    );
    quote = [];
  };

  const flushCode = () => {
    if (code === null) {
      return;
    }
    blocks.push(
      <pre
        key={blocks.length}
        style={{
          background: 'var(--bui-bg-neutral-2)',
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-3)',
          fontFamily: 'var(--bui-font-monospace)',
          margin: 'var(--bui-space-3) 0',
          overflowX: 'auto',
          padding: 'var(--bui-space-3) var(--bui-space-4)',
          whiteSpace: 'pre-wrap',
        }}
      >
        <code>{code.join('\n')}</code>
      </pre>,
    );
    code = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushOrdered();
    flushQuote();
  };

  const HEADING_VARIANT = [
    'title-medium',
    'title-small',
    'title-x-small',
  ] as const;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (code === null) {
        flushAll();
        code = [];
      } else {
        flushCode();
      }
      continue;
    }
    if (code !== null) {
      code.push(line);
      continue;
    }
    const quoted = /^\s*>\s?(.*)$/.exec(line);
    if (quoted) {
      flushParagraph();
      flushBullets();
      flushOrdered();
      quote.push(quoted[1]);
      continue;
    }
    flushQuote();
    if (/^\s*---+\s*$/.test(line)) {
      flushAll();
      blocks.push(
        <hr
          key={blocks.length}
          style={{
            border: 0,
            borderTop: '1px solid var(--bui-border-1)',
            margin: 'var(--bui-space-5) 0',
          }}
        />,
      );
      continue;
    }
    const heading = /^\s*(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      blocks.push(
        <Text
          key={blocks.length}
          as={`h${Math.min(level + 1, 6)}` as 'h2'}
          variant={HEADING_VARIANT[Math.min(level - 1, 2)]}
          weight="bold"
          style={{ marginTop: 'var(--bui-space-3)' }}
        >
          {renderInline(heading[2])}
        </Text>,
      );
      continue;
    }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      flushOrdered();
      bullets.push(bullet[1]);
      continue;
    }
    const numbered = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      flushBullets();
      ordered.push(numbered[1]);
      continue;
    }
    if (!line.trim()) {
      flushAll();
      continue;
    }
    flushBullets();
    flushOrdered();
    paragraph.push(line);
  }
  flushAll();
  flushCode();

  return <>{blocks}</>;
};
