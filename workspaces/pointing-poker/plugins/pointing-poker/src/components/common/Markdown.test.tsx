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
import '@testing-library/jest-dom';
import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('renders ticket images, links, tables and code as distinct content', () => {
    render(
      <Markdown
        text={[
          '## Acceptance criteria',
          '',
          'Read the [documentation](https://backstage.io/docs/) and **discuss**.',
          '',
          '![Reference screenshot](/reference.png)',
          '',
          '| State | Action |',
          '| --- | --- |',
          '| Loading | Wait |',
          '| Failed | **Retry** |',
          '',
          '```typescript',
          'const value = "![literal](/not-an-image.png)";',
          '```',
        ].join('\n')}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Acceptance criteria' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'documentation' })).toHaveAttribute(
      'href',
      'https://backstage.io/docs/',
    );
    expect(
      screen.getByRole('img', { name: 'Reference screenshot' }),
    ).toHaveAttribute('src', '/reference.png');
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.getAllByRole('columnheader').map(cell => cell.textContent),
    ).toEqual(['State', 'Action']);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(
      screen.getByRole('cell', { name: 'Retry' }).querySelector('strong'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByText('const value = "![literal](/not-an-image.png)";')
        .closest('pre'),
    ).toBeInTheDocument();
  });

  it('handles empty descriptions and leaves ordinary pipes as text', () => {
    const { rerender } = render(<Markdown text="" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(
      <Markdown
        text={'Use A | B for this case.\n\n- Keep lists\n- Keep `code`'}
      />,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Use A | B for this case.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
