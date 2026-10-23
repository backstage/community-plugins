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
import { Link, Text } from '@backstage/ui';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { Lexer, Token, Tokens } from 'marked';
import { Fragment, ReactNode, useMemo } from 'react';

/**
 * Props for {@link MarkdownText}.
 *
 * @public
 */
export interface MarkdownTextProps {
  /** The markdown source. */
  content: string;
  /** Class name of the wrapping element. */
  className?: string;
}

const HEADING_VARIANTS = [
  'title-medium',
  'title-small',
  'title-x-small',
  'title-x-small',
  'title-x-small',
  'title-x-small',
] as const;

function renderInline(tokens: Token[] | undefined): ReactNode[] {
  if (!tokens) return [];
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'strong':
        return (
          <strong key={i}>
            {renderInline((token as Tokens.Strong).tokens)}
          </strong>
        );
      case 'em':
        return <em key={i}>{renderInline((token as Tokens.Em).tokens)}</em>;
      case 'del':
        return <del key={i}>{renderInline((token as Tokens.Del).tokens)}</del>;
      case 'codespan':
        return <code key={i}>{(token as Tokens.Codespan).text}</code>;
      case 'br':
        return <br key={i} />;
      case 'link': {
        const link = token as Tokens.Link;
        const href = sanitizeUrl(link.href);
        const children = renderInline(link.tokens);
        if (href === 'about:blank') {
          return <Fragment key={i}>{children}</Fragment>;
        }
        const external = /^[a-z][a-z0-9+.-]*:/i.test(href);
        return (
          <Link
            key={i}
            href={href}
            title={link.title ?? undefined}
            {...(external ? { target: '_blank', rel: 'noopener' } : {})}
          >
            {children}
          </Link>
        );
      }
      case 'escape':
        return <Fragment key={i}>{(token as Tokens.Escape).text}</Fragment>;
      case 'text': {
        const text = token as Tokens.Text;
        return (
          <Fragment key={i}>
            {text.tokens ? renderInline(text.tokens) : text.text}
          </Fragment>
        );
      }
      default:
        // html, image and anything else render as their literal source
        return <Fragment key={i}>{token.raw}</Fragment>;
    }
  });
}

function renderBlocks(tokens: Token[]): ReactNode[] {
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'paragraph':
        return (
          <Text key={i} as="p">
            {renderInline((token as Tokens.Paragraph).tokens)}
          </Text>
        );
      case 'heading': {
        const heading = token as Tokens.Heading;
        const depth = Math.min(Math.max(heading.depth, 1), 6);
        return (
          <Text
            key={i}
            as={`h${depth}` as 'h1'}
            variant={HEADING_VARIANTS[depth - 1]}
          >
            {renderInline(heading.tokens)}
          </Text>
        );
      }
      case 'list': {
        const list = token as Tokens.List;
        const ListTag = list.ordered ? 'ol' : 'ul';
        return (
          <ListTag
            key={i}
            start={list.ordered && list.start !== '' ? list.start : undefined}
          >
            {list.items.map((item, j) => (
              <li key={j}>
                <Text as="span">{renderBlocksInline(item.tokens)}</Text>
              </li>
            ))}
          </ListTag>
        );
      }
      case 'code':
        return (
          <pre key={i}>
            <code>{(token as Tokens.Code).text}</code>
          </pre>
        );
      case 'blockquote':
        return (
          <blockquote key={i}>
            {renderBlocks((token as Tokens.Blockquote).tokens)}
          </blockquote>
        );
      case 'text':
        return (
          <Text key={i} as="p">
            {renderInline((token as Tokens.Text).tokens ?? [token])}
          </Text>
        );
      case 'space':
      case 'hr':
        return null;
      default:
        return (
          <Text key={i} as="p">
            {token.raw}
          </Text>
        );
    }
  });
}

/** List items contain block tokens; render them without paragraph wrappers. */
function renderBlocksInline(tokens: Token[]): ReactNode[] {
  return tokens.map((token, i) => {
    if (token.type === 'text' || token.type === 'paragraph') {
      return (
        <Fragment key={i}>
          {renderInline((token as Tokens.Text).tokens ?? [token])}
        </Fragment>
      );
    }
    return <Fragment key={i}>{renderBlocks([token])}</Fragment>;
  });
}

/**
 * Renders minimal markdown with Backstage UI elements and no HTML
 * injection. Supported: paragraphs, headings, bold, italic, inline code,
 * links, bullet and numbered lists, code blocks. Raw HTML is shown as text.
 *
 * @public
 */
export function MarkdownText(props: MarkdownTextProps) {
  const { content, className } = props;
  const nodes = useMemo(() => renderBlocks(Lexer.lex(content)), [content]);
  return <div className={className}>{nodes}</div>;
}
