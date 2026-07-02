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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitEditsDialog } from './SubmitEditsDialog';
import { EditedFile } from '@backstage-community/plugin-techdocs-editor-common';

const CHANGED_FILES: EditedFile[] = [
  { path: 'index.md', content: '# Updated', etag: 'abc' },
  { path: 'guide/setup.md', content: '# Setup', etag: 'def' },
];

describe('SubmitEditsDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <SubmitEditsDialog
        open={false}
        changedFiles={CHANGED_FILES}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    // MUI v4 Dialog is hidden when closed — the dialog title is not visible
    expect(
      screen.queryByText(/Submit Documentation Edits/i),
    ).not.toBeInTheDocument();
  });

  it('renders the dialog with changed file list when open', async () => {
    render(
      <SubmitEditsDialog
        open
        changedFiles={CHANGED_FILES}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    // MUI v4 Dialog content appears after Fade transition — use findBy
    expect(
      await screen.findByText(/Submit Documentation Edits/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/index\.md/)).toBeInTheDocument();
    expect(screen.getByText(/guide\/setup\.md/)).toBeInTheDocument();
  });

  it('uses the defaultPrTitle prop as initial PR title', async () => {
    render(
      <SubmitEditsDialog
        open
        changedFiles={CHANGED_FILES}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        defaultPrTitle="docs: my custom title"
      />,
    );
    const titleInput = (await screen.findByDisplayValue(
      'docs: my custom title',
    )) as HTMLInputElement;
    expect(titleInput.value).toBe('docs: my custom title');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = jest.fn();
    render(
      <SubmitEditsDialog
        open
        changedFiles={CHANGED_FILES}
        onClose={onClose}
        onSubmit={jest.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit with the entered values', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <SubmitEditsDialog
        open
        changedFiles={CHANGED_FILES}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        defaultPrTitle="docs: initial"
      />,
    );

    await userEvent.click(
      await screen.findByRole('button', { name: /Open Pull Request/i }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        prTitle: 'docs: initial',
        draft: false,
      }),
    );
  });

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('PR failed'));
    render(
      <SubmitEditsDialog
        open
        changedFiles={CHANGED_FILES}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(
      await screen.findByRole('button', { name: /Open Pull Request/i }),
    );
    expect(await screen.findByText(/PR failed/i)).toBeInTheDocument();
  });

  it('shows conflict message for 409 errors', async () => {
    const conflictError = Object.assign(new Error('Conflict'), {
      status: 409,
      conflicts: [{ path: 'index.md', userEtag: 'a', currentEtag: 'b' }],
    });
    const onSubmit = jest.fn().mockRejectedValue(conflictError);

    render(
      <SubmitEditsDialog
        open
        changedFiles={CHANGED_FILES}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(
      await screen.findByRole('button', { name: /Open Pull Request/i }),
    );
    expect(
      await screen.findByText(/Conflict detected on file/i),
    ).toBeInTheDocument();
  });
});
