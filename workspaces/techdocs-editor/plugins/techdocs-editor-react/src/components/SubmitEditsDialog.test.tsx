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

import '@testing-library/jest-dom';
import { renderInTestApp } from '@backstage/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { EditedFile } from '@backstage-community/plugin-techdocs-editor-common';
import { SubmitEditsDialog } from './SubmitEditsDialog';

jest.mock('react', () => jest.requireActual('react'));
jest.mock('react/jsx-runtime', () => jest.requireActual('react/jsx-runtime'));

const changedFiles: EditedFile[] = [
  {
    path: 'docs/index.md',
    content: '# Updated docs',
    etag: 'etag-1',
  },
];

async function renderDialog(
  props: Partial<import('react').ComponentProps<typeof SubmitEditsDialog>> = {},
) {
  const onClose = jest.fn();
  const onSubmit = jest.fn().mockResolvedValue(undefined);

  await renderInTestApp(
    <SubmitEditsDialog
      open
      changedFiles={changedFiles}
      onClose={onClose}
      onSubmit={onSubmit}
      {...(props as any)}
    />,
  );

  return { onClose, onSubmit };
}

describe('SubmitEditsDialog', () => {
  it('renders only the local save action when local save is the only capability', async () => {
    await renderDialog({ canSaveLocally: true, canCreatePullRequest: false });

    expect(
      screen.getByRole('button', { name: 'Save Locally' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Open Pull Request' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Pull Request Title')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Description (optional)'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Open as draft pull request'),
    ).not.toBeInTheDocument();
  });

  it('renders only the pull request action when pull requests are the only capability', async () => {
    await renderDialog({ canSaveLocally: false, canCreatePullRequest: true });

    expect(
      screen.queryByRole('button', { name: 'Save Locally' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Pull Request' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pull Request Title')).toBeInTheDocument();
    expect(
      screen.getAllByText('Description (optional)').length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Open as draft pull request')).toBeInTheDocument();
  });

  it('renders both actions when both capabilities are available', async () => {
    await renderDialog({ canSaveLocally: true, canCreatePullRequest: true });

    expect(
      screen.getByRole('button', { name: 'Save Locally' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Pull Request' }),
    ).toBeInTheDocument();
  });

  it('renders no action buttons when no submission capability is available', async () => {
    await renderDialog({ canSaveLocally: false, canCreatePullRequest: false });

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save Locally' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Open Pull Request' }),
    ).not.toBeInTheDocument();
  });

  it('submits a local save action', async () => {
    const { onSubmit } = await renderDialog({
      canSaveLocally: true,
      canCreatePullRequest: false,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Locally' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        action: 'save-locally',
        prTitle: 'docs: update documentation',
        prDescription: '',
        commitMessage: 'docs: update via Backstage TechDocs editor',
        draft: false,
      });
    });
  });

  it('submits a pull request action with the entered title', async () => {
    const { onSubmit } = await renderDialog({
      canSaveLocally: false,
      canCreatePullRequest: true,
      defaultPrTitle: '',
    });

    const [titleInput] = screen.getAllByRole('textbox');

    fireEvent.change(titleInput, {
      target: { value: 'docs: update getting started guide' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open Pull Request' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        action: 'create-pull-request',
        prTitle: 'docs: update getting started guide',
        prDescription: '',
        commitMessage: 'docs: update via Backstage TechDocs editor',
        draft: false,
      });
    });
  });

  it('only shows a loading label for the action being submitted', async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolveSubmit = resolve;
        }),
    );

    await renderInTestApp(
      <SubmitEditsDialog
        open
        changedFiles={changedFiles}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        canSaveLocally
        canCreatePullRequest
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Locally' }));

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Pull Request' }),
    ).toBeInTheDocument();

    resolveSubmit?.();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Save Locally' }),
      ).toBeInTheDocument(),
    );
  });

  it('shows the pull request confirmation panel with a copyable link', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(window.navigator, { clipboard: { writeText } });

    const onSubmit = jest
      .fn()
      .mockResolvedValue({ pullRequestUrl: 'https://example.com/pr/42' });

    await renderInTestApp(
      <SubmitEditsDialog
        open
        changedFiles={changedFiles}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        canSaveLocally={false}
        canCreatePullRequest
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Pull Request' }));

    await screen.findByText('Pull Request Created');
    expect(
      screen.getByRole('link', { name: /open pull request/i }),
    ).toHaveAttribute('href', 'https://example.com/pr/42');
    expect(
      screen.getByDisplayValue('https://example.com/pr/42'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy pull request link' }),
    );

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('https://example.com/pr/42'),
    );
  });
});
