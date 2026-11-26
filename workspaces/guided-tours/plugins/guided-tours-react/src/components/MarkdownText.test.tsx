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
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MarkdownText } from './MarkdownText';

const renderMd = (content: string) =>
  render(
    <MemoryRouter>
      <MarkdownText content={content} />
    </MemoryRouter>,
  );

describe('MarkdownText', () => {
  it('renders inline formatting', () => {
    const { container } = renderMd('Hello **bold** and _em_ and `code`.');
    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('em')).toHaveTextContent('em');
    expect(container.querySelector('code')).toHaveTextContent('code');
  });

  it('renders lists and headings', () => {
    const { container } = renderMd('## Title\n\n- one\n- two\n\n1. a\n2. b');
    expect(container.querySelector('h2')).toHaveTextContent('Title');
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
  });

  it('renders links and drops unsafe ones', () => {
    renderMd(
      '[catalog](/catalog) [ext](https://example.com) [bad](javascript:alert(1))',
    );
    expect(screen.getByRole('link', { name: 'catalog' })).toHaveAttribute(
      'href',
      '/catalog',
    );
    expect(screen.getByRole('link', { name: 'ext' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.queryByRole('link', { name: 'bad' })).toBeNull();
    expect(screen.getByText('bad')).toBeInTheDocument();
  });

  it('shows html as text instead of injecting it', () => {
    const { container } = renderMd('x <img src=x onerror=alert(1)> y');
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('<img src=x onerror=alert(1)>');
  });

  it('renders the remaining block and inline tokens', () => {
    const { container } = renderMd(
      '~~gone~~ line  \nbreak \\* escaped [t](/x "Title")\n\n```\nconst a = 1;\n```\n\n> quoted\n\n---\n\n- item with `code`\n\n  nested paragraph',
    );
    expect(container.querySelector('del')).toHaveTextContent('gone');
    expect(container.querySelector('br')).not.toBeNull();
    expect(container).toHaveTextContent('* escaped');
    expect(screen.getByRole('link', { name: 't' })).toHaveAttribute(
      'title',
      'Title',
    );
    expect(container.querySelector('pre code')).toHaveTextContent(
      'const a = 1;',
    );
    expect(container.querySelector('blockquote')).toHaveTextContent('quoted');
    expect(container.querySelector('hr')).toBeNull();
    expect(container.querySelector('li code')).toHaveTextContent('code');
    expect(container.querySelector('li')).toHaveTextContent('nested paragraph');
  });

  it('renders nothing for empty content', () => {
    const { container } = renderMd('');
    expect(container).toHaveTextContent('');
  });
});
