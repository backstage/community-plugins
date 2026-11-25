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
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { TableOfContents } from './TableOfContents';
import { PATH_SEPARATOR } from '../../../consts/consts';
import type { UrlTree } from '../../../types';
import type { FlattenedNode } from '../../../hooks/useFlattenTree';

const tree: UrlTree = {
  Foo: {
    Bar: 'https://example.com/bar',
    Baz: 'https://example.com/baz',
  },
  Qux: 'https://example.com/qux',
  Goo: {
    SubGoo: 'https://example.com/sub-goo',
  },
};

const currentNode: FlattenedNode = {
  key: ['Foo', 'Bar'].join(PATH_SEPARATOR),
  value: 'https://example.com/bar',
};

const renderTable = (setCurrentNode = jest.fn()) =>
  renderInTestApp(
    <TableOfContents
      tree={tree}
      currentNode={currentNode}
      setCurrentNode={setCurrentNode}
    />,
  );

describe('TableOfContents', () => {
  it('renders all visible tree items', async () => {
    await renderTable();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Baz')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();
  });

  it('exposes tree grid semantics', async () => {
    await renderTable();

    // the test app does not load translation resources, so the accessible
    // name is the translation key instead of the English message
    expect(
      screen.getByRole('treegrid', { name: 'bookmarkViewer.tableOfContents' }),
    ).toBeInTheDocument();

    // react-aria-components renders the tree as a treegrid; nesting level
    // and expansion state are conveyed by the rows
    const bar = screen.getByRole('row', { name: 'Bar' });
    expect(bar).toHaveAttribute('aria-level', '2');

    const foo = screen.getByRole('row', { name: 'Foo' });
    expect(foo).toHaveAttribute('aria-level', '1');
    expect(foo).toHaveAttribute('aria-expanded', 'true');

    const goo = screen.getByRole('row', { name: 'Goo' });
    expect(goo).toHaveAttribute('aria-expanded', 'false');
  });

  it('highlights the current node', async () => {
    await renderTable();
    const bar = screen.getByRole('row', { name: 'Bar' });
    expect(bar).toHaveClass('selected');
    expect(bar).toHaveAttribute('data-current', 'true');
    expect(screen.getByText('Bar')).toHaveAttribute('aria-current', 'true');
    const baz = screen.getByRole('row', { name: 'Baz' });
    expect(baz).not.toHaveClass('selected');
    expect(baz).not.toHaveAttribute('data-current');
    expect(screen.getByText('Baz')).not.toHaveAttribute('aria-current');
  });

  it('moves the highlight when navigating, without an external rerender', async () => {
    // stateful wrapper so that clicking a leaf updates currentNode, like the
    // real parent component does
    const StatefulTable = () => {
      const [current, setCurrent] = useState(currentNode);
      return (
        <TableOfContents
          tree={tree}
          currentNode={current}
          setCurrentNode={setCurrent}
        />
      );
    };
    await renderInTestApp(<StatefulTable />);

    act(() => {
      screen.getByText('Baz').click();
    });
    // react-aria caches rendered items by identity, so the cache must be
    // invalidated for the new highlight to show up
    await waitFor(() => {
      expect(screen.getByRole('row', { name: 'Baz' })).toHaveClass('selected');
    });
    expect(screen.getByRole('row', { name: 'Baz' })).toHaveAttribute(
      'data-current',
      'true',
    );
    expect(screen.getByRole('row', { name: 'Bar' })).not.toHaveClass(
      'selected',
    );
  });

  it('expands and collapses folders when the row is clicked', async () => {
    await renderTable();
    expect(screen.queryByText('SubGoo')).not.toBeInTheDocument();

    act(() => {
      screen.getByText('Goo').click();
    });
    expect(screen.getByText('SubGoo')).toBeVisible();

    act(() => {
      screen.getByText('Goo').click();
    });
    await waitFor(() => {
      expect(screen.queryByText('SubGoo')).not.toBeInTheDocument();
    });
  });

  it('calls setCurrentNode when a leaf is clicked', async () => {
    const setCurrentNodeMock = jest.fn();
    await renderTable(setCurrentNodeMock);
    act(() => {
      screen.getByText('Bar').click();
    });
    expect(setCurrentNodeMock).toHaveBeenCalledWith({
      key: ['Foo', 'Bar'].join(PATH_SEPARATOR),
      value: 'https://example.com/bar',
    });
  });

  it('marks a folder as current when the current node is a folder', async () => {
    await renderInTestApp(
      <TableOfContents
        tree={tree}
        currentNode={{ key: 'Goo', value: 'https://example.com/sub-goo' }}
        setCurrentNode={jest.fn()}
      />,
    );
    expect(screen.getByText('Goo')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Foo')).not.toHaveAttribute('aria-current');
    expect(screen.getByText('SubGoo')).not.toHaveAttribute('aria-current');
  });

  it('uses a roving tabindex with a single tab stop', async () => {
    await renderTable();

    // before interaction the tree grid itself is the tab stop; tabbing into
    // it moves focus onto the first row
    const treeElement = screen.getByRole('treegrid');
    expect(treeElement).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('row').every(row => row.tabIndex === -1)).toBe(
      true,
    );

    // once a row is focused, it becomes the single tab stop
    act(() => {
      screen.getByRole('row', { name: 'Bar' }).focus();
    });
    await waitFor(() => {
      expect(screen.getByRole('row', { name: 'Bar' })).toHaveAttribute(
        'tabindex',
        '0',
      );
    });
    const tabStops = screen
      .getAllByRole('row')
      .filter(row => row.tabIndex === 0);
    expect(tabStops).toHaveLength(1);
    expect(tabStops[0]).toHaveAccessibleName('Bar');
    expect(treeElement).toHaveAttribute('tabindex', '-1');
  });

  it('activates the focused item with the keyboard', async () => {
    const setCurrentNodeMock = jest.fn();
    await renderTable(setCurrentNodeMock);

    // Enter on a focused folder toggles expansion
    const goo = screen.getByRole('row', { name: 'Goo' });
    // focusing a row updates react-aria state, which must happen inside act
    act(() => {
      goo.focus();
    });
    fireEvent.keyDown(goo, { key: 'Enter' });
    fireEvent.keyUp(goo, { key: 'Enter' });
    expect(screen.getByText('SubGoo')).toBeVisible();

    // Enter on a focused leaf navigates
    const bar = screen.getByRole('row', { name: 'Bar' });
    act(() => {
      bar.focus();
    });
    fireEvent.keyDown(bar, { key: 'Enter' });
    fireEvent.keyUp(bar, { key: 'Enter' });
    expect(setCurrentNodeMock).toHaveBeenCalledWith({
      key: ['Foo', 'Bar'].join(PATH_SEPARATOR),
      value: 'https://example.com/bar',
    });
  });

  it('supports arrow key navigation', async () => {
    await renderTable();
    const bar = screen.getByRole('row', { name: 'Bar' });
    act(() => {
      bar.focus();
    });

    // down moves to the next visible item
    fireEvent.keyDown(bar, { key: 'ArrowDown' });
    const baz = screen.getByRole('row', { name: 'Baz' });
    expect(baz).toHaveFocus();

    // left on a leaf moves focus to its parent
    fireEvent.keyDown(baz, { key: 'ArrowLeft' });
    const foo = screen.getByRole('row', { name: 'Foo' });
    expect(foo).toHaveFocus();

    // left on an expanded item collapses it
    fireEvent.keyDown(foo, { key: 'ArrowLeft' });
    expect(foo).toHaveAttribute('aria-expanded', 'false');
    expect(foo).toHaveFocus();
    expect(screen.queryByRole('row', { name: 'Bar' })).not.toBeInTheDocument();

    // right on a collapsed item expands it without moving focus
    fireEvent.keyDown(foo, { key: 'ArrowRight' });
    expect(foo).toHaveAttribute('aria-expanded', 'true');
    expect(foo).toHaveFocus();

    // right on an expanded item keeps focus on the row; the chevron is
    // excluded from the tab order, so there is nothing to focus within it
    fireEvent.keyDown(foo, { key: 'ArrowRight' });
    expect(foo).toHaveFocus();

    // home and end move to the first and last visible item
    fireEvent.keyDown(foo, { key: 'End' });
    expect(screen.getByRole('row', { name: 'Goo' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('row', { name: 'Goo' }), {
      key: 'Home',
    });
    expect(foo).toHaveFocus();
  });
});
