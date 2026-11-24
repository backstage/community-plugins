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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiCodeLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiGitPullRequestLine,
  RiSaveLine,
  RiUpload2Line,
} from '@remixicon/react';
import {
  Progress,
  ResponseErrorPanel,
  Header,
  Page,
  Content,
} from '@backstage/core-components';
import { MissingAnnotationEmptyState } from '@backstage/plugin-catalog-react';
import { CompoundEntityRef } from '@backstage/catalog-model';
import { TECHDOCS_ANNOTATION } from '@backstage/plugin-techdocs-common';
import {
  EditedFile,
  DocTreeNode,
  MkDocsConfig,
} from '@backstage-community/plugin-techdocs-editor-common';
import { useTechDocsEditorApi } from '../api';
import { TechDocsFileTree } from './TechDocsFileTree';
import { TechDocsMarkdownEditor } from './TechDocsMarkdownEditor';
import { TechDocsMediaPreview } from './TechDocsMediaPreview';
import { SubmitEditsDialog } from './SubmitEditsDialog';
import { ChangesDrawer } from './ChangesDrawer';
import styles from './TechDocsEditorPage.module.css';

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
]);
const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Props for {@link TechDocsEditorPage}.
 * @public
 */
export type TechDocsEditorPageProps = {
  entityRef: CompoundEntityRef;
  /** Pre-selected file path (e.g. when linked from the TechDocs addon) */
  initialPath?: string;
  /** Whether the entity has the techdocs annotation — if false, shows empty state */
  hasTechDocsAnnotation?: boolean;
};

/**
 * Full-page TechDocs editor: file tree on the left, WYSIWYG editor on the right.
 * @public
 */
export function TechDocsEditorPage({
  entityRef,
  initialPath,
  hasTechDocsAnnotation = true,
}: TechDocsEditorPageProps) {
  const api = useTechDocsEditorApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mkdocsConfig, setMkdocsConfig] = useState<MkDocsConfig | null>(null);
  const [treeNodes, setTreeNodes] = useState<DocTreeNode[]>([]);
  const [branch, setBranch] = useState<string>('');
  const [docsDir, setDocsDir] = useState<string | undefined>(undefined);

  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    initialPath,
  );
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<Error | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editedFiles, setEditedFiles] = useState<Map<string, EditedFile>>(
    new Map(),
  );
  // Mirror of `editedFiles` for use inside effects that must not re-run on
  // every keystroke (reading the ref avoids listing `editedFiles` as a dep).
  const editedFilesRef = useRef(editedFiles);
  editedFilesRef.current = editedFiles;
  // Set of paths with unsaved edits. Tracked as its own state so its identity
  // only changes when membership changes (not on every keystroke), which keeps
  // the memoized file tree from re-rendering while typing.
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(new Set());
  const originalEtags = useRef<Map<string, string>>(new Map());
  // Pristine content as loaded from the source, keyed by path. Toast UI
  // Editor fires `onChange` once on mount as it re-serializes the markdown
  // internally, even without any user interaction. Comparing against this
  // baseline lets us tell a real edit apart from that mount-time noise, so
  // simply opening a file never silently marks it dirty and pulls it into
  // the next submission.
  const originalContents = useRef<Map<string, string>>(new Map());
  // Reactive counterpart of `originalContents`/`originalEtags`, keyed by
  // path. This is intentionally *state* (not just a ref) so that the
  // pristine content for `selectedPath` can be derived synchronously in the
  // same render where `selectedPath` changes — see `fileContent` below.
  //
  // IMPORTANT: `fileContent`/`fileMimeType` used to be their own `useState`,
  // set from inside a `useEffect` keyed on `selectedPath`. Toast UI's React
  // wrapper only reads `initialContent` once, at mount — it never re-applies
  // it on prop updates. Because effects run *after* the render that changes
  // `selectedPath` (and the `key` on `TechDocsMarkdownEditor`) commits, the
  // freshly (re)mounted editor was capturing whatever `fileContent` still
  // held from the *previously* selected file (e.g. a just-uploaded image's
  // base64 payload) as its `initialContent`, and never corrected itself once
  // the effect later set the right value. Toast UI's own mount-time
  // re-serialization then fired `onChange` with that stale content, which
  // got staged as a "real" edit — corrupting the document. Deriving content
  // synchronously from state already available in the same render (below)
  // eliminates that race.
  const [pristineFiles, setPristineFiles] = useState<
    Map<string, { content: string; mimeType?: string; etag: string }>
  >(new Map());
  // Paths of referenced images we've already attempted to fetch for preview
  // purposes (successfully or not), so the effect below never refetches the
  // same missing/broken image on every render.
  const imageFetchAttempted = useRef<Set<string>>(new Set());

  const [sourceMode, setSourceMode] = useState(true);
  // Bumped whenever an image is inserted into the *currently open* markdown
  // doc via its own toolbar upload (as opposed to switching to a different
  // file). Toast UI's React wrapper only reads `customHTMLRenderer` (which
  // `resolveImageSrc` feeds into, for turning an image's relative path into
  // a previewable `src`) once, at mount — it never re-applies it while the
  // component stays mounted, same as `initialContent`. Without this, an
  // image inserted through the toolbar renders with whatever
  // `resolveImageSrc` closure existed *before* the upload (which doesn't
  // know about the image yet) and shows a broken-image icon until the user
  // navigates away and back, which force-remounts the editor. Including
  // this counter in the editor's `key` forces that same remount immediately
  // after an upload, so the new image resolves right away.
  const [editorRemountToken, setEditorRemountToken] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canSaveLocally, setCanSaveLocally] = useState(false);
  const [canCreatePullRequest, setCanCreatePullRequest] = useState(false);
  const replaceImageInputRef = useRef<HTMLInputElement | null>(null);

  const requestEntityRef = useMemo(
    () => ({
      kind: entityRef.kind,
      name: entityRef.name,
      namespace: entityRef.namespace,
    }),
    [entityRef.kind, entityRef.name, entityRef.namespace],
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getFileTree(requestEntityRef),
      api.getMkDocsConfig(requestEntityRef),
    ])
      .then(([tree, config]) => {
        setBranch(tree.branch);
        setDocsDir(tree.docsDir);
        setCanSaveLocally(tree.canSaveLocally);
        setCanCreatePullRequest(tree.canCreatePullRequest);
        setMkdocsConfig(config);
        const nodes: DocTreeNode[] = buildTree(
          tree.nodes.map(n => n.path!).filter(Boolean),
        );
        setTreeNodes(nodes);
        const first = initialPath ?? tree.nodes[0]?.path;
        if (first) setSelectedPath(first);
      })
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [api, requestEntityRef, initialPath]);

  // Fetches pristine content for `selectedPath` when it isn't already
  // available (neither staged in `editedFiles` nor previously fetched into
  // `pristineFiles`). Both of those are checked synchronously at render time
  // below when deriving `fileContent`, so this effect only needs to handle
  // the "not loaded yet" case — it must never be the sole source of content
  // for a freshly (re)mounted editor, since editors only read their initial
  // content once, at mount.
  useEffect(() => {
    if (!selectedPath || !branch) return;
    if (editedFilesRef.current.has(selectedPath)) return;
    if (pristineFiles.has(selectedPath)) return;

    setFileLoading(true);
    setFileError(null);
    api
      .getFile(requestEntityRef, selectedPath, branch)
      .then(({ content, mimeType, etag }) => {
        originalEtags.current.set(selectedPath, etag);
        originalContents.current.set(selectedPath, content);
        setPristineFiles(prev =>
          new Map(prev).set(selectedPath, { content, mimeType, etag }),
        );
      })
      .catch(e => setFileError(e))
      .finally(() => setFileLoading(false));
  }, [api, requestEntityRef, selectedPath, branch, pristineFiles]);

  // Content for the currently selected path, derived synchronously from
  // state that's already up to date in the same render as `selectedPath`
  // (unlike the old approach of copying it into its own state from inside
  // an effect, which lagged a render behind and caused stale content to be
  // used as a freshly mounted editor's initial value — see the comment on
  // `pristineFiles` above).
  const activeEditedFile = selectedPath
    ? editedFiles.get(selectedPath)
    : undefined;
  const pristineFile = selectedPath
    ? pristineFiles.get(selectedPath)
    : undefined;
  const fileContent = activeEditedFile
    ? activeEditedFile.content ?? ''
    : pristineFile?.content ?? '';
  const fileMimeType = activeEditedFile
    ? activeEditedFile.mimeType
    : pristineFile?.mimeType;
  // Whether we actually have *some* content loaded for `selectedPath` yet
  // (either staged or fetched). Gates rendering the editor/preview so they
  // never mount with another path's leftover content.
  const contentReady = Boolean(activeEditedFile || pristineFile);
  const isSelectedImage = Boolean(selectedPath) && isImagePath(selectedPath!);

  // Doc-relative paths of every image referenced (via markdown image syntax)
  // by the currently open markdown file, resolved from their as-written
  // (possibly relative) destinations. Used both to preload their content for
  // preview and to gate mounting the editor until previews can resolve.
  const referencedImagePaths = useMemo(() => {
    if (!selectedPath || isSelectedImage || !contentReady) return [];
    const paths = new Set<string>();
    for (const destination of extractImageDestinations(fileContent)) {
      const resolved = resolveImageDestination(selectedPath, destination);
      if (resolved) paths.add(resolved);
    }
    return Array.from(paths);
  }, [selectedPath, isSelectedImage, contentReady, fileContent]);

  // Toast UI Editor is uncontrolled — like `initialContent`, any image `src`
  // it renders at mount time is never revisited later, even if the actual
  // image content only becomes available afterwards (see the comment on
  // `pristineFiles` above for the general pattern this follows). So rather
  // than patching image elements after the fact, we hold off mounting the
  // editor until every referenced image's content is already resolvable —
  // exactly like `contentReady` does for the document's own content.
  useEffect(() => {
    if (referencedImagePaths.length === 0 || !branch) return;
    const missing = referencedImagePaths.filter(
      path =>
        !editedFilesRef.current.has(path) &&
        !pristineFiles.has(path) &&
        !imageFetchAttempted.current.has(path),
    );
    if (missing.length === 0) return;

    missing.forEach(path => imageFetchAttempted.current.add(path));
    missing.forEach(path => {
      api
        .getFile(requestEntityRef, path, branch)
        .then(({ content, mimeType, etag }) => {
          setPristineFiles(prev =>
            new Map(prev).set(path, { content, mimeType, etag }),
          );
        })
        .catch(() => {
          // Referenced image doesn't exist (or can't be loaded) — leave it
          // unresolved. `resolveImageSrc` falls back to the original
          // (likely broken) destination in that case, same as before this
          // preview-resolution feature existed; it does not block the rest
          // of the document from rendering.
        });
    });
  }, [api, requestEntityRef, branch, referencedImagePaths, pristineFiles]);

  const imagesReady = referencedImagePaths.every(
    path =>
      editedFilesRef.current.has(path) ||
      pristineFiles.has(path) ||
      imageFetchAttempted.current.has(path),
  );

  /**
   * Resolves a markdown image `destination` (as written in the doc) to a
   * previewable `src` — a `data:` URI built from staged or fetched content
   * when available, or the original destination unchanged if not (e.g.
   * external URLs, or images that failed to resolve).
   */
  const resolveImageSrc = useCallback(
    (destination: string): string => {
      if (!selectedPath) return destination;
      const resolvedPath = resolveImageDestination(selectedPath, destination);
      if (!resolvedPath) return destination;

      const staged = editedFiles.get(resolvedPath);
      const fetched = pristineFiles.get(resolvedPath);
      const content = staged ? staged.content : fetched?.content;
      const mimeType = staged ? staged.mimeType : fetched?.mimeType;
      if (!content) return destination;

      return `data:${
        mimeType ?? inferImageMimeType(resolvedPath)
      };base64,${content}`;
    },
    [selectedPath, editedFiles, pristineFiles],
  );

  const handleContentChange = useCallback(
    (markdown: string) => {
      if (!selectedPath) return;
      const original = originalContents.current.get(selectedPath);
      setEditedFiles(prev => {
        const next = new Map(prev);
        if (markdown === original) {
          // Content matches what was loaded (or the editor's mount-time
          // re-serialization produced an identical result) — this isn't a
          // real edit, so don't include it in the next submission.
          next.delete(selectedPath);
          return next;
        }
        const etag = originalEtags.current.get(selectedPath) ?? '';
        next.set(selectedPath, {
          path: selectedPath,
          content: markdown,
          encoding: 'utf8',
          etag,
        });
        return next;
      });
      setDirtyPaths(prev => {
        if (markdown === original) {
          if (!prev.has(selectedPath)) return prev;
          const next = new Set(prev);
          next.delete(selectedPath);
          return next;
        }
        return prev.has(selectedPath) ? prev : new Set(prev).add(selectedPath);
      });
    },
    [selectedPath],
  );

  const handleCreateFile = useCallback((relativePath: string) => {
    const initialContent = `# ${
      relativePath.replace(/\.md$/, '').split('/').pop()?.replace(/-/g, ' ') ??
      'New Page'
    }`;
    setEditedFiles(prev => {
      const next = new Map(prev);
      next.set(relativePath, {
        path: relativePath,
        content: initialContent,
        encoding: 'utf8',
        etag: '',
      });
      return next;
    });
    setDirtyPaths(prev =>
      prev.has(relativePath) ? prev : new Set(prev).add(relativePath),
    );
    setTreeNodes(prev => {
      const allPaths = collectPaths(prev).concat(relativePath);
      return buildTree(allPaths);
    });
    setSelectedPath(relativePath);
  }, []);

  const stageImageFile = useCallback(
    async (file: File, targetPath: string) => {
      setUploadError(null);

      const ext = getFileExtension(file.name);
      if (!SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
        throw new Error(
          'Only PNG, JPG, JPEG, GIF, SVG, and WEBP are supported.',
        );
      }
      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        throw new Error('Image exceeds the 10MB upload limit.');
      }
      if (!isSafeDocPath(file.name)) {
        throw new Error(
          'File name contains unsupported characters. Use letters, numbers, dots, hyphens, or underscores.',
        );
      }

      const base64Content = await fileToBase64(file);

      let etag = originalEtags.current.get(targetPath) ?? '';
      if (!etag && treeNodes.length > 0 && hasPath(treeNodes, targetPath)) {
        try {
          const existing = await api.getFile(
            requestEntityRef,
            targetPath,
            branch,
          );
          etag = existing.etag;
          originalEtags.current.set(targetPath, existing.etag);
          originalContents.current.set(targetPath, existing.content);
        } catch {
          etag = '';
        }
      }

      setEditedFiles(prev => {
        const next = new Map(prev);
        next.set(targetPath, {
          path: targetPath,
          content: base64Content,
          encoding: 'base64',
          mimeType: file.type || undefined,
          etag,
        });
        return next;
      });
      setDirtyPaths(prev =>
        prev.has(targetPath) ? prev : new Set(prev).add(targetPath),
      );
      setTreeNodes(prev => {
        if (hasPath(prev, targetPath)) {
          return prev;
        }
        const allPaths = collectPaths(prev).concat(targetPath);
        return buildTree(allPaths);
      });

      return {
        targetPath,
        base64Content,
        mimeType: file.type || undefined,
      };
    },
    [api, branch, requestEntityRef, treeNodes],
  );

  const handleReplaceImage = useCallback(async () => {
    const input = replaceImageInputRef.current;
    const file = input?.files?.[0];
    if (!file || !selectedPath) {
      return;
    }
    input.value = '';

    const targetPath = joinDirectoryAndFile(
      directoryOfPath(selectedPath),
      file.name,
    );
    const uploaded = await stageImageFile(file, targetPath);
    setSelectedPath(uploaded.targetPath);
  }, [selectedPath, stageImageFile]);

  const uploadImageForCurrentDoc = useCallback(
    async (file: File) => {
      if (!selectedPath || isImagePath(selectedPath)) {
        throw new Error('Select a markdown file before inserting an image.');
      }
      const targetPath = joinDirectoryAndFile(
        directoryOfPath(selectedPath),
        file.name,
      );
      const uploaded = await stageImageFile(file, targetPath);
      const relativePath = toRelativeMarkdownPath(
        selectedPath,
        uploaded.targetPath,
      );
      const altText = file.name.replace(/\.[^.]+$/, '');
      // Force the editor to remount once this resolves (see the comment on
      // `editorRemountToken` above) so the image it's about to insert
      // renders correctly right away instead of as a broken icon.
      setEditorRemountToken(t => t + 1);
      return { url: relativePath, altText };
    },
    [selectedPath, stageImageFile],
  );

  const handleDeleteImage = useCallback(() => {
    if (!selectedPath || !isImagePath(selectedPath)) {
      return;
    }
    const etag = originalEtags.current.get(selectedPath) ?? '';
    setEditedFiles(prev => {
      const next = new Map(prev);
      next.set(selectedPath, {
        path: selectedPath,
        content: null,
        encoding: 'base64',
        mimeType: fileMimeType,
        etag,
      });
      return next;
    });
    setDirtyPaths(prev =>
      prev.has(selectedPath) ? prev : new Set(prev).add(selectedPath),
    );
  }, [fileMimeType, selectedPath]);

  const handleSubmit = async (opts: {
    action: 'save-locally' | 'create-pull-request';
    prTitle: string;
    prDescription: string;
    commitMessage: string;
    draft: boolean;
  }) => {
    const files: EditedFile[] = Array.from(editedFiles.values());
    const result = await api.submitEdits(entityRef, {
      files,
      action: opts.action,
      prTitle: opts.action === 'create-pull-request' ? opts.prTitle : undefined,
      prDescription: opts.prDescription,
      commitMessage: opts.commitMessage,
      draft: opts.draft,
    });
    // The just-submitted content becomes the new pristine baseline so the
    // editor/preview keep showing it (rather than reverting to whatever was
    // cached before these edits) once `editedFiles` is cleared below.
    setPristineFiles(prev => {
      const next = new Map(prev);
      for (const file of files) {
        if (file.content === null) {
          next.delete(file.path);
          originalContents.current.delete(file.path);
          continue;
        }
        next.set(file.path, {
          content: file.content,
          mimeType: file.mimeType,
          etag: file.etag,
        });
        originalContents.current.set(file.path, file.content);
      }
      return next;
    });
    setEditedFiles(new Map());
    setDirtyPaths(new Set());

    if (result.savedLocally) {
      // Local saves close the dialog and show a toast; there's no PR link
      // to keep the dialog open for.
      setSubmitOpen(false);
      const count = result.savedCount ?? files.length;
      setSuccessMessage(`Saved ${count} file${count !== 1 ? 's' : ''} to disk`);
    }
    // For PR submissions, leave the dialog open — SubmitEditsDialog shows
    // its own "Pull Request Opened" confirmation with the link once this
    // promise resolves with `result`, instead of navigating away.
    return result;
  };

  const dirtyCount = dirtyPaths.size;
  const isSelectedImageStagedDelete = selectedPath
    ? editedFiles.get(selectedPath)?.content === null && isSelectedImage
    : false;

  // Auto-hide the success toast after 6 seconds (replaces MUI Snackbar's
  // autoHideDuration, which BUI's Alert has no equivalent for).
  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Warn the user before leaving (reload/close) if there are unsaved edits.
  useEffect(() => {
    if (dirtyCount === 0) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirtyCount]);

  // Memoize the sidebar so it does not re-render on every keystroke. Its props
  // are stable while typing (`dirtyPaths` identity only changes when the set of
  // edited files changes, not on content edits).
  const fileTree = useMemo(
    () => (
      <TechDocsFileTree
        nodes={treeNodes}
        selectedPath={selectedPath}
        dirtyPaths={dirtyPaths}
        onSelect={setSelectedPath}
        onCreateFile={handleCreateFile}
        branch={branch}
        docsDir={docsDir}
      />
    ),
    [treeNodes, selectedPath, dirtyPaths, handleCreateFile, branch, docsDir],
  );

  if (!hasTechDocsAnnotation) {
    return <MissingAnnotationEmptyState annotation={TECHDOCS_ANNOTATION} />;
  }

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Page themeId="documentation">
      <Header
        title={`Edit Docs: ${mkdocsConfig?.site_name ?? entityRef.name}`}
        subtitle={`${entityRef.kind}:${entityRef.namespace ?? 'default'}/${
          entityRef.name
        }`}
      />
      <Content noPadding>
        <div className={styles.shell}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([sourceMode ? 'markdown' : 'visual'])}
              onSelectionChange={keys =>
                setSourceMode([...keys][0] === 'markdown')
              }
            >
              <TooltipTrigger>
                <ToggleButton id="visual" iconStart={<RiEyeLine size={16} />}>
                  Visual
                </ToggleButton>
                <Tooltip>WYSIWYG mode</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger>
                <ToggleButton
                  id="markdown"
                  iconStart={<RiCodeLine size={16} />}
                >
                  Markdown
                </ToggleButton>
                <Tooltip>Markdown source mode</Tooltip>
              </TooltipTrigger>
            </ToggleButtonGroup>

            <Text variant="body-x-small" color="secondary">
              Branch: <strong>{branch}</strong>
            </Text>

            {selectedPath && isSelectedImage && (
              <>
                <input
                  ref={replaceImageInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.svg,.webp,image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                  className={styles.hiddenInput}
                  onChange={() => {
                    handleReplaceImage().catch((e: unknown) => {
                      setUploadError(
                        e instanceof Error
                          ? e.message
                          : 'Failed to upload image file.',
                      );
                    });
                  }}
                />
                <Button
                  variant="secondary"
                  iconStart={<RiUpload2Line size={16} />}
                  onPress={() => replaceImageInputRef.current?.click()}
                >
                  Replace Image
                </Button>
                <Button
                  variant="secondary"
                  iconStart={<RiDeleteBinLine size={16} />}
                  onPress={handleDeleteImage}
                >
                  Remove Image
                </Button>
              </>
            )}

            {dirtyCount > 0 && (
              <TooltipTrigger>
                <Button
                  variant="secondary"
                  iconStart={<RiGitPullRequestLine size={16} />}
                  onPress={() => setDrawerOpen(true)}
                >
                  {dirtyCount} change{dirtyCount !== 1 ? 's' : ''}
                </Button>
                <Tooltip>Review all your changes before submitting</Tooltip>
              </TooltipTrigger>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <Button
                variant="primary"
                isDisabled={dirtyCount === 0}
                iconStart={<RiSaveLine size={16} />}
                onPress={() => setSubmitOpen(true)}
              >
                Submit Changes
                {dirtyCount > 0 && (
                  <span className={styles.changedCount}>{dirtyCount}</span>
                )}
              </Button>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Body: sidebar + editor */}
          <div className={styles.body}>
            {fileTree}

            <div className={styles.editorArea}>
              {selectedPath &&
                !fileError &&
                (!contentReady || (!isSelectedImage && !imagesReady)) && (
                  <div className={styles.noFileSelected}>
                    <Text color="secondary">Loading…</Text>
                  </div>
                )}
              {fileError && <ResponseErrorPanel error={fileError} />}
              {uploadError && (
                <Alert
                  status="danger"
                  title={uploadError}
                  className={styles.toast}
                />
              )}
              {!selectedPath && !fileLoading && (
                <div className={styles.noFileSelected}>
                  <Text color="secondary">Select a file to edit</Text>
                </div>
              )}
              {selectedPath &&
                contentReady &&
                (isSelectedImage || imagesReady) &&
                !fileError &&
                isSelectedImageStagedDelete && (
                  <div className={styles.noFileSelected}>
                    <Text color="secondary">
                      This image is staged for deletion.
                    </Text>
                  </div>
                )}
              {selectedPath &&
                contentReady &&
                (isSelectedImage || imagesReady) &&
                !fileError &&
                !isSelectedImageStagedDelete &&
                (isSelectedImage ? (
                  <TechDocsMediaPreview
                    path={selectedPath}
                    content={fileContent}
                    mimeType={fileMimeType}
                  />
                ) : (
                  <TechDocsMarkdownEditor
                    key={`${selectedPath}::${editorRemountToken}`}
                    initialContent={fileContent}
                    onChange={handleContentChange}
                    sourceMode={sourceMode}
                    onUploadImage={uploadImageForCurrentDoc}
                    resolveImageSrc={resolveImageSrc}
                  />
                ))}
            </div>
          </div>
        </div>

        <SubmitEditsDialog
          open={submitOpen}
          changedFiles={Array.from(editedFiles.values())}
          originalContents={originalContents.current}
          onClose={() => setSubmitOpen(false)}
          onSubmit={handleSubmit}
          defaultPrTitle={`docs: update ${
            mkdocsConfig?.site_name ?? entityRef.name
          } documentation`}
          canSaveLocally={canSaveLocally}
          canCreatePullRequest={canCreatePullRequest}
        />

        <ChangesDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          changedFiles={Array.from(editedFiles.values())}
          originalContents={originalContents.current}
        />

        {/* Success notification for local saves */}
        {successMessage && (
          <Alert
            status="success"
            title={successMessage}
            className={styles.toast}
          />
        )}
      </Content>
    </Page>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Build a nested tree from a flat list of file paths like "getting-started.md", "api/overview.md" */
function buildTree(paths: string[]): DocTreeNode[] {
  const root: DocTreeNode[] = [];

  for (const p of paths.sort()) {
    const parts = p.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.push({
          title: part.replace(/\.md$/, '').replace(/-/g, ' '),
          path: p,
        });
      } else {
        let dir = current.find(n => n.title === part && !n.path);
        if (!dir) {
          dir = { title: part, children: [] };
          current.push(dir);
        }
        current = dir.children!;
      }
    }
  }

  return root;
}

/** Collect every leaf file path from a nested tree. */
function collectPaths(nodes: DocTreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.path) paths.push(node.path);
    if (node.children) paths.push(...collectPaths(node.children));
  }
  return paths;
}

function getFileExtension(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  return dot >= 0 ? filePath.slice(dot).toLocaleLowerCase('en-US') : '';
}

function isImagePath(filePath: string): boolean {
  return SUPPORTED_IMAGE_EXTENSIONS.has(getFileExtension(filePath));
}

const IMAGE_MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/** Best-effort MIME type for a path, used as a fallback for data URIs when
 * the backend/staged upload didn't record one. */
function inferImageMimeType(filePath: string): string {
  return (
    IMAGE_MIME_TYPES_BY_EXTENSION[getFileExtension(filePath)] ??
    'application/octet-stream'
  );
}

function directoryOfPath(filePath: string): string {
  const slash = filePath.lastIndexOf('/');
  return slash >= 0 ? filePath.slice(0, slash) : '';
}

function joinDirectoryAndFile(directory: string, fileName: string): string {
  return directory ? `${directory}/${fileName}` : fileName;
}

function toRelativeMarkdownPath(
  fromFilePath: string,
  toFilePath: string,
): string {
  const fromParts = directoryOfPath(fromFilePath).split('/').filter(Boolean);
  const toParts = toFilePath.split('/').filter(Boolean);

  let common = 0;
  while (
    common < fromParts.length &&
    common < toParts.length &&
    fromParts[common] === toParts[common]
  ) {
    common++;
  }

  const upSegments = new Array(fromParts.length - common).fill('..');
  const downSegments = toParts.slice(common);
  const joined = [...upSegments, ...downSegments].join('/');
  return joined.startsWith('.') ? joined : `./${joined}`;
}

function hasPath(nodes: DocTreeNode[], targetPath: string): boolean {
  return collectPaths(nodes).includes(targetPath);
}

function isSafeDocPath(value: string): boolean {
  return /^[a-zA-Z0-9_.-]+$/.test(value);
}

const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

/** Extracts every image `destination` referenced via markdown image syntax. */
function extractImageDestinations(markdown: string): string[] {
  const destinations: string[] = [];
  for (const match of markdown.matchAll(MARKDOWN_IMAGE_PATTERN)) {
    if (match[1]) destinations.push(match[1]);
  }
  return destinations;
}

/**
 * Resolves a markdown image `destination` (as written in a doc) to the
 * doc-relative repo path it points at, so its actual (possibly staged)
 * content can be looked up for preview purposes. Returns `undefined` for
 * destinations that are already absolute (external URLs, data URIs,
 * protocol-relative) since those don't need resolving.
 */
function resolveImageDestination(
  fromFilePath: string,
  destination: string,
): string | undefined {
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(destination)) return undefined;
  if (destination.startsWith('data:')) return undefined;

  const relative = destination.startsWith('/')
    ? destination.slice(1)
    : destination;
  const baseDir = destination.startsWith('/')
    ? []
    : directoryOfPath(fromFilePath).split('/').filter(Boolean);

  const stack = [...baseDir];
  for (const part of relative.split('/').filter(Boolean)) {
    if (part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
}

async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read file for upload.'));
    reader.readAsDataURL(file);
  });
  const comma = dataUrl.indexOf(',');
  if (comma < 0) {
    throw new Error('Invalid image data payload.');
  }
  return dataUrl.slice(comma + 1);
}
