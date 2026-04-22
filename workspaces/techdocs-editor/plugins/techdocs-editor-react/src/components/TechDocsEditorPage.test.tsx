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

import React from 'react';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { TechDocsEditorPage } from './TechDocsEditorPage';
import { TechDocsEditorApiRef, TechDocsEditorApi } from '../api';

// Mock the markdown editor to avoid prosemirror jsdom incompatibilities
jest.mock('./TechDocsMarkdownEditor', () => ({
  TechDocsMarkdownEditor: ({ initialContent }: { initialContent: string }) => (
    <div data-testid="mock-editor">{initialContent}</div>
  ),
}));

const ENTITY_REF = {
  namespace: 'default',
  kind: 'component',
  name: 'my-service',
};

const MOCK_TREE = {
  nodes: [
    { title: 'index.md', path: 'index.md' },
    { title: 'guide/setup.md', path: 'guide/setup.md' },
  ],
  sourceEtag: '',
  branch: 'main',
};

const MOCK_MKDOCS = {
  site_name: 'My Service',
  docs_dir: 'docs',
  repo_url: 'https://github.com/org/my-service',
  edit_uri: 'edit/main/',
  nav: null,
};

const MOCK_FILE = {
  content: '# Hello\nWorld',
  etag: 'etag-abc',
  branch: 'main',
};

function makeMockApi(
  overrides: Partial<TechDocsEditorApi> = {},
): TechDocsEditorApi {
  return {
    getMkDocsConfig: jest.fn().mockResolvedValue(MOCK_MKDOCS),
    getFileTree: jest.fn().mockResolvedValue(MOCK_TREE),
    getFile: jest.fn().mockResolvedValue(MOCK_FILE),
    submitEdits: jest.fn().mockResolvedValue({
      pullRequestUrl: 'https://github.com/org/my-service/pull/1',
      pullRequestNumber: 1,
      headBranch: 'techdocs-editor/user/123',
    }),
    ...overrides,
  };
}

async function renderPage(
  api: TechDocsEditorApi = makeMockApi(),
  props: Partial<React.ComponentProps<typeof TechDocsEditorPage>> = {},
) {
  return renderInTestApp(
    <TestApiProvider apis={[[TechDocsEditorApiRef, api]]}>
      <TechDocsEditorPage entityRef={ENTITY_REF} {...props} />
    </TestApiProvider>,
  );
}

describe('TechDocsEditorPage', () => {
  it('renders the page header and fetches the file tree', async () => {
    const api = makeMockApi();
    await renderPage(api);
    // Header renders after async load
    expect(
      await screen.findByText(/Edit Docs: My Service/i),
    ).toBeInTheDocument();
    // Verify the tree was fetched for the given entity
    expect(api.getFileTree).toHaveBeenCalledWith(ENTITY_REF);
  });

  it('shows current branch name in the toolbar', async () => {
    await renderPage();
    // Branch is rendered inside a <strong> in the toolbar
    expect(await screen.findByText('main')).toBeInTheDocument();
  });

  it('shows an error panel when the API call fails', async () => {
    const api = makeMockApi({
      getFileTree: jest.fn().mockRejectedValue(new Error('Network error')),
    });
    await renderPage(api);
    // Error may appear in multiple elements (heading + detail); check at least one
    expect(
      (await screen.findAllByText(/Network error/i)).length,
    ).toBeGreaterThan(0);
  });

  it('shows empty state when entity has no techdocs annotation', async () => {
    await renderPage(makeMockApi(), { hasTechDocsAnnotation: false });
    // MissingAnnotationEmptyState renders the annotation name in multiple elements
    expect(
      (await screen.findAllByText(/backstage\.io\/techdocs-ref/i)).length,
    ).toBeGreaterThan(0);
  });

  it('auto-loads the first file in the tree on mount', async () => {
    const api = makeMockApi();
    await renderPage(api);

    // After the tree loads the component auto-selects the first file and fetches it
    await screen.findByText(/Edit Docs: My Service/i);
    expect(api.getFile).toHaveBeenCalledWith(ENTITY_REF, 'index.md', 'main');
  });

  it('shows the loaded file content in the mock editor', async () => {
    await renderPage();
    // TechDocsMarkdownEditor is mocked to render its initialContent as text
    // The auto-selected file (first in tree = index.md) triggers getFile
    expect(await screen.findByTestId('mock-editor')).toBeInTheDocument();
  });

  it('marks the Submit Changes button as disabled with no edits', async () => {
    await renderPage();
    await screen.findByText(/Edit Docs: My Service/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Changes/i });
    expect(submitBtn).toBeDisabled();
  });
});
