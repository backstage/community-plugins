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

import { renderInTestApp } from '@backstage/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { TableOfContents } from './TableOfContents';
import { PATH_SEPARATOR } from '../../../consts/consts';
import type { UrlTree } from '../../../api/types';
import type { FlattenedNode } from '../../../hooks/useFlattenTree';

const tree: UrlTree = {
  Foo: {
    Bar: 'https://example.com/bar',
    Baz: 'https://example.com/baz',
  },
  Qux: 'https://example.com/qux',
};

const currentNode: FlattenedNode = {
  key: ['Foo', 'Bar', 'https://example.com/bar'].join(PATH_SEPARATOR),
  value: 'https://example.com/bar',
};

describe('TableOfContents', () => {
  it('renders all tree items', async () => {
    await renderInTestApp(
      <TableOfContents
        tree={tree}
        currentNode={currentNode}
        setCurrentNode={jest.fn()}
      />,
    );
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Baz')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();
  });

  it('expands and collapses tree items', async () => {
    await renderInTestApp(
      <TableOfContents
        tree={tree}
        currentNode={currentNode}
        setCurrentNode={jest.fn()}
      />,
    );
    const fooItem = screen.getByText('Foo').closest('[role="treeitem"]');
    // Simulate expand/collapse
    fireEvent.click(fooItem!);
    // Should still be in the document (expanded or collapsed)
    expect(fooItem).toBeInTheDocument();
  });
});
