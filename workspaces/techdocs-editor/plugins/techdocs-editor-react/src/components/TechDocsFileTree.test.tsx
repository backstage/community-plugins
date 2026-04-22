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

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TechDocsFileTree } from './TechDocsFileTree';
import { DocTreeNode } from '@backstage-community/plugin-techdocs-editor-common';

const NODES: DocTreeNode[] = [
  { title: 'index', path: 'index.md' },
  {
    title: 'guide',
    children: [
      { title: 'setup', path: 'guide/setup.md' },
      { title: 'advanced', path: 'guide/advanced.md' },
    ],
  },
];

describe('TechDocsFileTree', () => {
  it('renders file and folder nodes', () => {
    render(<TechDocsFileTree nodes={NODES} onSelect={jest.fn()} />);
    expect(screen.getByText('index')).toBeInTheDocument();
    expect(screen.getByText('guide')).toBeInTheDocument();
    expect(screen.getByText('setup')).toBeInTheDocument();
  });

  it('calls onSelect with the file path when a file is clicked', async () => {
    const onSelect = jest.fn();
    render(<TechDocsFileTree nodes={NODES} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('index'));
    expect(onSelect).toHaveBeenCalledWith('index.md');
  });

  it('highlights the selected path', () => {
    const { container } = render(
      <TechDocsFileTree
        nodes={NODES}
        selectedPath="index.md"
        onSelect={jest.fn()}
      />,
    );
    // The active list item should have the activeItem class applied
    const activeItem = container.querySelector('[class*="activeItem"]');
    expect(activeItem).not.toBeNull();
  });

  it('shows a dirty dot on modified files', () => {
    render(
      <TechDocsFileTree
        nodes={NODES}
        dirtyPaths={new Set(['index.md'])}
        onSelect={jest.fn()}
      />,
    );
    const dot = document.querySelector('[class*="dirtyDot"]');
    expect(dot).not.toBeNull();
  });

  it('does not show the New Page button when onCreateFile is not provided', () => {
    render(<TechDocsFileTree nodes={NODES} onSelect={jest.fn()} />);
    expect(
      screen.queryByRole('button', { name: /create new page/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the New Page button when onCreateFile is provided', () => {
    render(
      <TechDocsFileTree
        nodes={NODES}
        onSelect={jest.fn()}
        onCreateFile={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: /create new page/i }),
    ).toBeInTheDocument();
  });

  it('opens the New Page dialog and calls onCreateFile with valid path', async () => {
    const onCreateFile = jest.fn();
    render(
      <TechDocsFileTree
        nodes={NODES}
        onSelect={jest.fn()}
        onCreateFile={onCreateFile}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create new page/i }),
    );
    expect(await screen.findByText('Create New Page')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/getting-started\.md/i);
    await userEvent.type(input, 'new-page.md');
    await userEvent.click(screen.getByRole('button', { name: /^create$/i }));

    expect(onCreateFile).toHaveBeenCalledWith('new-page.md');
  });

  it('validates that new page path ends with .md', async () => {
    render(
      <TechDocsFileTree
        nodes={NODES}
        onSelect={jest.fn()}
        onCreateFile={jest.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create new page/i }),
    );

    const input = screen.getByPlaceholderText(/getting-started\.md/i);
    await userEvent.type(input, 'bad-path.txt');
    fireEvent.blur(input);

    expect(await screen.findByText(/must end with \.md/i)).toBeInTheDocument();
  });

  it('prevents creating a file that already exists', async () => {
    render(
      <TechDocsFileTree
        nodes={NODES}
        onSelect={jest.fn()}
        onCreateFile={jest.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create new page/i }),
    );

    const input = screen.getByPlaceholderText(/getting-started\.md/i);
    await userEvent.type(input, 'index.md'); // already exists
    fireEvent.blur(input);

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
  });
});
