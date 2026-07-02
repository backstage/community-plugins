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
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, Text } from '@backstage/ui';
import { dedent } from '../utils/dedent';

const inlineCodeStyle: React.CSSProperties = {
  fontFamily: 'var(--bui-font-mono, monospace)',
  fontSize: '0.85em',
  background: 'var(--bui-bg-surface-2, rgba(127,127,127,0.15))',
  padding: '0.1em 0.35em',
  borderRadius: 4,
};

const preStyle: React.CSSProperties = {
  fontFamily: 'var(--bui-font-mono, monospace)',
  fontSize: '0.85em',
  background: 'var(--bui-bg-surface-2, rgba(127,127,127,0.12))',
  padding: '0.75em',
  borderRadius: 6,
  overflowX: 'auto',
  margin: '0.5em 0',
};

const components: Components = {
  p: ({ children }) => (
    <Text as="p" variant="body-medium" style={{ margin: '0 0 0.5em' }}>
      {children}
    </Text>
  ),
  h1: ({ children }) => (
    <Text
      as="h4"
      variant="title-small"
      weight="bold"
      style={{ margin: '0.75em 0 0.35em' }}
    >
      {children}
    </Text>
  ),
  h2: ({ children }) => (
    <Text
      as="h4"
      variant="title-small"
      weight="bold"
      style={{ margin: '0.75em 0 0.35em' }}
    >
      {children}
    </Text>
  ),
  h3: ({ children }) => (
    <Text
      as="h5"
      variant="body-large"
      weight="bold"
      style={{ margin: '0.6em 0 0.3em' }}
    >
      {children}
    </Text>
  ),
  h4: ({ children }) => (
    <Text
      as="h5"
      variant="body-large"
      weight="bold"
      style={{ margin: '0.6em 0 0.3em' }}
    >
      {children}
    </Text>
  ),
  strong: ({ children }) => (
    <Text as="strong" weight="bold">
      {children}
    </Text>
  ),
  em: ({ children }) => <Text as="em">{children}</Text>,
  a: ({ href, children }) => <Link href={href ?? '#'}>{children}</Link>,
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 0.5em', paddingLeft: '1.4em' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 0.5em', paddingLeft: '1.4em' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ margin: '0.15em 0' }}>
      <Text as="span" variant="body-medium">
        {children}
      </Text>
    </li>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code style={inlineCodeStyle}>{children}</code>
    ) : (
      <code>{children}</code>
    ),
  pre: ({ children }) => <pre style={preStyle}>{children}</pre>,
};

/**
 * Renders Markdown text as readable prose using pure BUI primitives (no MUI).
 *
 * @public
 */
export function Markdown(props: { children: string }) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {dedent(props.children)}
      </ReactMarkdown>
    </div>
  );
}
