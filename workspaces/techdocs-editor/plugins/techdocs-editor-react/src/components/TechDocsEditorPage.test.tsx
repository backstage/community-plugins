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
import { useRef } from 'react';
import { renderInTestApp } from '@backstage/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

jest.mock('react', () => jest.requireActual('react'));
jest.mock('react/jsx-runtime', () => jest.requireActual('react/jsx-runtime'));

jest.mock('@backstage/core-components', () => ({
  Progress: () => <div>Loading…</div>,
  ResponseErrorPanel: ({ error }: { error: Error }) => (
    <div>{error.message}</div>
  ),
  Header: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <div>{subtitle}</div>}
    </div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../api', () => ({
  useTechDocsEditorApi: jest.fn(),
}));

jest.mock('./TechDocsMarkdownEditor', () => ({
  // Real Toast UI Editor is *uncontrolled*: it only reads `initialContent`
  // (and other mount-time-only options like `customHTMLRenderer`, which is
  // what `resolveImageSrc` feeds into) once, at mount, and never re-applies
  // them on prop updates (its React wrapper's `shouldComponentUpdate`
  // always returns `false`). This mock captures both the same way (via refs
  // set only on first render) so tests exercise the same "stale initial
  // value on remount" hazard the real editor has, instead of trivially
  // reflecting whatever props happen to be passed on every render.
  TechDocsMarkdownEditor: ({
    initialContent,
    onChange,
    onUploadImage,
    resolveImageSrc,
  }: {
    initialContent: string;
    onChange: (markdown: string) => void;
    onUploadImage?: (file: File) => Promise<{ url: string; altText: string }>;
    resolveImageSrc?: (destination: string) => string;
  }) => {
    const mountedContent = useRef(initialContent);
    const mountedResolveImageSrc = useRef(resolveImageSrc);
    const imageMatches = Array.from(
      mountedContent.current.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g),
    );
    return (
      <div>
        <div data-testid="mock-editor-content">{mountedContent.current}</div>
        {imageMatches.map(([, alt, destination]) => (
          <img
            key={destination}
            alt={alt}
            src={mountedResolveImageSrc.current?.(destination) ?? destination}
          />
        ))}
        <button onClick={() => onChange(`${mountedContent.current}\nEdited`)}>
          Make Edit
        </button>
        {onUploadImage && (
          <button
            onClick={() => {
              const file = new File(['fake'], 'native.png', {
                type: 'image/png',
              });
              onUploadImage(file).then(({ url, altText }) => {
                onChange(`${mountedContent.current}\n![${altText}](${url})`);
              });
            }}
          >
            Toolbar Image Insert
          </button>
        )}
      </div>
    );
  },
}));

import { TechDocsEditorPage } from './TechDocsEditorPage';
import { useTechDocsEditorApi } from '../api';

type MockApi = {
  getFileTree: jest.Mock;
  getMkDocsConfig: jest.Mock;
  getFile: jest.Mock;
  submitEdits: jest.Mock;
};

const mockUseTechDocsEditorApi = useTechDocsEditorApi as jest.MockedFunction<
  typeof useTechDocsEditorApi
>;

function createApi(overrides?: Partial<MockApi>): MockApi {
  return {
    getFileTree: jest.fn().mockResolvedValue({
      nodes: [{ title: 'index.md', path: 'index.md' }],
      sourceEtag: 'tree-etag',
      branch: 'main',
      docsDir: 'docs',
      canSaveLocally: true,
      canCreatePullRequest: true,
    }),
    getMkDocsConfig: jest.fn().mockResolvedValue({
      site_name: 'Test Docs',
      docs_dir: 'docs',
    }),
    getFile: jest.fn().mockResolvedValue({
      content: '# Hello',
      etag: 'etag-1',
      branch: 'main',
    }),
    submitEdits: jest
      .fn()
      .mockResolvedValue({ pullRequestUrl: 'https://example.com/pr/1' }),
    ...overrides,
  };
}

async function renderPage(api: MockApi, expectedPath = 'index.md') {
  mockUseTechDocsEditorApi.mockReturnValue(api as any);

  await renderInTestApp(
    <TechDocsEditorPage
      entityRef={{ kind: 'Component', namespace: 'default', name: 'sample' }}
    />,
  );

  await screen.findByText('Edit Docs: Test Docs');
  await waitFor(() =>
    expect(api.getFile).toHaveBeenCalledWith(
      { kind: 'Component', namespace: 'default', name: 'sample' },
      expectedPath,
      'main',
    ),
  );
}

describe('TechDocsEditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const api = createApi();

    await renderPage(api);

    expect(screen.getByText('Branch:')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit changes/i }),
    ).toBeDisabled();
  });

  it('stages an image uploaded via the editor toolbar and preserves it when navigating away and back', async () => {
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [
          { title: 'index.md', path: 'index.md' },
          { title: 'other.md', path: 'other.md' },
        ],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: true,
      }),
      getFile: jest.fn().mockImplementation((_ref, path) =>
        Promise.resolve({
          content: path === 'other.md' ? '# Other' : '# Hello',
          etag: `etag-${path}`,
          branch: 'main',
        }),
      ),
    });
    await renderPage(api);

    // Upload an image through the editor's own toolbar button.
    fireEvent.click(
      screen.getByRole('button', { name: 'Toolbar Image Insert' }),
    );
    // The upload should stage a new file in the tree without waiting on the
    // (uncontrolled) editor to reflect the change in its `initialContent`
    // prop immediately.
    await screen.findByRole('button', { name: 'native.png' });

    // Navigate away to another file, then back to the original one.
    fireEvent.click(screen.getByRole('button', { name: 'other' }));
    await screen.findByText('# Other');
    fireEvent.click(screen.getByRole('button', { name: 'index' }));

    // The staged image insertion must survive the round trip — it should
    // neither be dropped nor replaced with unrelated/corrupted content.
    await waitFor(() =>
      expect(
        screen.getByText('# Hello ![native](./native.png)'),
      ).toBeInTheDocument(),
    );
  });

  it("preserves a markdown file's content after previewing a just-uploaded image and switching back", async () => {
    // Regression test for a bug where opening the image that was just
    // staged via the editor toolbar (to preview it), then switching back to
    // the markdown file that referenced it, corrupted the markdown file's
    // content — because the (uncontrolled) editor was remounted with
    // whatever content the shared "current file" state happened to still
    // hold at that instant, before an effect had a chance to correct it.
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [{ title: 'index.md', path: 'index.md' }],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: true,
      }),
      getFile: jest.fn().mockResolvedValue({
        content: '# Hello',
        etag: 'etag-index.md',
        branch: 'main',
      }),
    });
    await renderPage(api);

    // Upload an image through the editor's own toolbar button.
    fireEvent.click(
      screen.getByRole('button', { name: 'Toolbar Image Insert' }),
    );
    // The upload should stage a new file in the tree. (The visible editor
    // is not remounted here — its `key` is still `index.md` — so, just like
    // the real Toast UI editor, the mock's own displayed content is
    // unaffected until a remount; only the underlying staged content in
    // `editedFiles` has changed at this point.)
    await screen.findByRole('button', { name: 'native.png' });

    // Preview the just-uploaded image from the sidebar...
    fireEvent.click(screen.getByRole('button', { name: 'native.png' }));
    await screen.findByRole('img', { name: 'native.png' });

    // ...then switch back to the markdown file.
    fireEvent.click(screen.getByRole('button', { name: 'index' }));

    // The markdown file's content must be intact — not replaced with the
    // image's raw content, and not dropped/emptied.
    await waitFor(() =>
      expect(
        screen.getByText('# Hello ![native](./native.png)'),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole('img', { name: 'native.png' })).toBeNull();
  });

  it('resolves an image uploaded via the toolbar to a data URI immediately, without navigating away first', async () => {
    // Regression test: Toast UI's React wrapper only reads
    // `customHTMLRenderer` (which is what `resolveImageSrc` feeds into)
    // once, at mount, and never re-applies it while the component stays
    // mounted. Inserting an image via the toolbar used to render with the
    // pre-upload `resolveImageSrc` closure — which doesn't know about the
    // image yet — showing a broken-image icon until the user navigated away
    // to another file and back (which force-remounts the editor). The
    // editor must now force its own remount right after an upload so the
    // image resolves immediately, with no navigation required.
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [{ title: 'index.md', path: 'index.md' }],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: true,
      }),
      getFile: jest.fn().mockResolvedValue({
        content: '# Hello',
        etag: 'etag-index.md',
        branch: 'main',
      }),
    });
    await renderPage(api);

    fireEvent.click(
      screen.getByRole('button', { name: 'Toolbar Image Insert' }),
    );

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'native' })).toHaveAttribute(
        'src',
        expect.stringMatching(/^data:image\/png;base64,/),
      ),
    );
  });

  it("resolves an existing repo image referenced in a doc's markdown to a data URI instead of leaving it as a broken relative path", async () => {
    // Regression test: markdown image links are relative paths (e.g.
    // `./diagram.png`), which don't resolve to anything on the editor's own
    // page, so without preview-resolution every referenced image — whether
    // newly inserted or already committed — rendered as a broken-image
    // icon. This exercises an image that was *not* uploaded in this
    // session (so it's only available by fetching it from the backend), to
    // make sure that path resolves too, not just freshly staged uploads.
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [
          { title: 'index.md', path: 'index.md' },
          { title: 'diagram.png', path: 'diagram.png' },
        ],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: true,
      }),
      getFile: jest.fn().mockImplementation((_ref, path) => {
        if (path === 'diagram.png') {
          return Promise.resolve({
            content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
            encoding: 'base64',
            mimeType: 'image/png',
            etag: 'etag-diagram.png',
            branch: 'main',
          });
        }
        return Promise.resolve({
          content: '# Hello\n\n![diagram](./diagram.png)',
          etag: 'etag-index.md',
          branch: 'main',
        });
      }),
    });

    await renderPage(api);

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'diagram' })).toHaveAttribute(
        'src',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
      ),
    );
  });

  it('renders image files as media preview instead of markdown editor', async () => {
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [{ title: 'diagram.png', path: 'diagram.png' }],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: true,
      }),
      getFile: jest.fn().mockResolvedValue({
        content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
        encoding: 'base64',
        mimeType: 'image/png',
        etag: 'etag-image-1',
        branch: 'main',
      }),
    });

    await renderPage(api, 'diagram.png');

    expect(
      screen.getByRole('img', { name: 'diagram.png' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Replace Image' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Make Edit' }),
    ).not.toBeInTheDocument();
  });

  it('shows only Save Locally when local save is the only capability', async () => {
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [{ title: 'index.md', path: 'index.md' }],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: false,
      }),
    });

    await renderPage(api);

    fireEvent.click(screen.getByRole('button', { name: 'Make Edit' }));
    fireEvent.click(screen.getByRole('button', { name: /submit changes/i }));

    expect(
      screen.getByRole('button', { name: 'Save Locally' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Open Pull Request' }),
    ).not.toBeInTheDocument();
  });

  it('shows only Open Pull Request when PRs are the only capability', async () => {
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [{ title: 'index.md', path: 'index.md' }],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: false,
        canCreatePullRequest: true,
      }),
    });

    await renderPage(api);

    fireEvent.click(screen.getByRole('button', { name: 'Make Edit' }));
    fireEvent.click(screen.getByRole('button', { name: /submit changes/i }));

    expect(
      screen.queryByRole('button', { name: 'Save Locally' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Pull Request' }),
    ).toBeInTheDocument();
  });

  it('forwards save-locally action and omits prTitle for local saves', async () => {
    const api = createApi({
      getFileTree: jest.fn().mockResolvedValue({
        nodes: [{ title: 'index.md', path: 'index.md' }],
        sourceEtag: 'tree-etag',
        branch: 'main',
        docsDir: 'docs',
        canSaveLocally: true,
        canCreatePullRequest: false,
      }),
      submitEdits: jest.fn().mockResolvedValue({
        savedLocally: true,
        savedCount: 1,
      }),
    });

    await renderPage(api);

    fireEvent.click(screen.getByRole('button', { name: 'Make Edit' }));
    fireEvent.click(screen.getByRole('button', { name: /submit changes/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Locally' }));

    await waitFor(() => {
      expect(api.submitEdits).toHaveBeenCalledWith(
        { kind: 'Component', namespace: 'default', name: 'sample' },
        {
          files: [
            {
              path: 'index.md',
              content: '# Hello\nEdited',
              encoding: 'utf8',
              etag: 'etag-1',
            },
          ],
          action: 'save-locally',
          prTitle: undefined,
          prDescription: '',
          commitMessage: 'docs: update via Backstage TechDocs editor',
          draft: false,
        },
      );
    });
  });

  it('shows the pull request confirmation popup with a link instead of navigating away', async () => {
    const api = createApi({
      submitEdits: jest
        .fn()
        .mockResolvedValue({ pullRequestUrl: 'https://example.com/pr/1' }),
    });

    await renderPage(api);

    fireEvent.click(screen.getByRole('button', { name: 'Make Edit' }));
    fireEvent.click(screen.getByRole('button', { name: /submit changes/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Pull Request' }));

    await screen.findByText('Pull Request Created');
    expect(
      screen.getByRole('link', { name: /open pull request/i }),
    ).toHaveAttribute('href', 'https://example.com/pr/1');
    expect(
      screen.getByDisplayValue('https://example.com/pr/1'),
    ).toBeInTheDocument();

    // Dialog stays open until the user explicitly closes it.
    expect(
      screen.getAllByRole('button', { name: 'Done' }).length,
    ).toBeGreaterThan(0);
  });
});
