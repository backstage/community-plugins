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

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CodeIcon from '@material-ui/icons/Code';
import VisibilityIcon from '@material-ui/icons/Visibility';
import SaveIcon from '@material-ui/icons/Save';
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
import { SubmitEditsDialog } from './SubmitEditsDialog';

const useStyles = makeStyles(theme => ({
  shell: {
    height: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(1),
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editorArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  noFileSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: theme.palette.text.secondary,
  },
  unsavedBadge: {
    marginLeft: 'auto',
    color: theme.palette.warning.main,
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  changedCount: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(0.25, 0.75),
    borderRadius: 12,
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
}));

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
  const classes = useStyles();
  const api = useTechDocsEditorApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mkdocsConfig, setMkdocsConfig] = useState<MkDocsConfig | null>(null);
  const [treeNodes, setTreeNodes] = useState<DocTreeNode[]>([]);
  const [branch, setBranch] = useState<string>('');

  // Currently open file
  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    initialPath,
  );
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<Error | null>(null);

  // Dirty state — map of path → {content, etag} for files the user has modified
  const [editedFiles, setEditedFiles] = useState<Map<string, EditedFile>>(
    new Map(),
  );
  const originalEtags = useRef<Map<string, string>>(new Map());

  // Editor mode
  const [sourceMode, setSourceMode] = useState(false);

  // Submit dialog
  const [submitOpen, setSubmitOpen] = useState(false);

  // Load file tree + mkdocs config on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([api.getFileTree(entityRef), api.getMkDocsConfig(entityRef)])
      .then(([tree, config]) => {
        setBranch(tree.branch);
        setMkdocsConfig(config);
        // Build tree nodes from flat file list
        const nodes: DocTreeNode[] = buildTree(
          tree.nodes.map(n => n.path!).filter(Boolean),
        );
        setTreeNodes(nodes);
        // Auto-select first file or the initialPath
        const first = initialPath ?? tree.nodes[0]?.path;
        if (first) setSelectedPath(first);
      })
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [entityRef.name, entityRef.kind, entityRef.namespace]);

  // Load file when selection changes
  useEffect(() => {
    if (!selectedPath || !branch) return;

    // If already edited in-memory, show edited version
    const edited = editedFiles.get(selectedPath);
    if (edited) {
      setFileContent(edited.content ?? '');
      return;
    }

    setFileLoading(true);
    setFileError(null);
    api
      .getFile(entityRef, selectedPath, branch)
      .then(({ content, etag }) => {
        setFileContent(content);
        originalEtags.current.set(selectedPath, etag);
      })
      .catch(e => setFileError(e))
      .finally(() => setFileLoading(false));
  }, [selectedPath, branch]);

  const handleContentChange = useCallback(
    (markdown: string) => {
      if (!selectedPath) return;
      const etag = originalEtags.current.get(selectedPath) ?? '';
      setEditedFiles(prev => {
        const next = new Map(prev);
        next.set(selectedPath, { path: selectedPath, content: markdown, etag });
        return next;
      });
    },
    [selectedPath],
  );

  const handleCreateFile = useCallback((relativePath: string) => {
    // Mark as a new (unsaved) file with empty etag so the backend treats it as a new file
    const initialContent = `# ${
      relativePath.replace(/\.md$/, '').split('/').pop()?.replace(/-/g, ' ') ??
      'New Page'
    }`;
    setEditedFiles(prev => {
      const next = new Map(prev);
      next.set(relativePath, {
        path: relativePath,
        content: initialContent,
        etag: '',
      });
      return next;
    });
    // Inject into the visible tree
    setTreeNodes(prev => {
      const allPaths = collectPaths(prev).concat(relativePath);
      return buildTree(allPaths);
    });
    setSelectedPath(relativePath);
    setFileContent(initialContent);
  }, []);

  const handleSubmit = async (opts: {
    prTitle: string;
    prDescription: string;
    commitMessage: string;
    draft: boolean;
  }) => {
    const files: EditedFile[] = Array.from(editedFiles.values());
    const result = await api.submitEdits(entityRef, {
      files,
      prTitle: opts.prTitle,
      prDescription: opts.prDescription,
      commitMessage: opts.commitMessage,
      draft: opts.draft,
    });
    setEditedFiles(new Map());
    setSubmitOpen(false);
    window.open(result.pullRequestUrl, '_blank', 'noopener,noreferrer');
  };

  const dirtyPaths = new Set(editedFiles.keys());
  const dirtyCount = dirtyPaths.size;

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
        <div className={classes.shell}>
          {/* Toolbar */}
          <div className={classes.toolbar}>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="WYSIWYG mode">
                <Button
                  onClick={() => setSourceMode(false)}
                  color={!sourceMode ? 'primary' : 'default'}
                  startIcon={<VisibilityIcon fontSize="small" />}
                >
                  Visual
                </Button>
              </Tooltip>
              <Tooltip title="Markdown source mode">
                <Button
                  onClick={() => setSourceMode(true)}
                  color={sourceMode ? 'primary' : 'default'}
                  startIcon={<CodeIcon fontSize="small" />}
                >
                  Markdown
                </Button>
              </Tooltip>
            </ButtonGroup>

            <Typography variant="caption" color="textSecondary">
              Branch: <strong>{branch}</strong>
            </Typography>

            {dirtyCount > 0 && (
              <Typography className={classes.unsavedBadge} variant="caption">
                ● {dirtyCount} file{dirtyCount > 1 ? 's' : ''} changed
              </Typography>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={dirtyCount === 0}
                startIcon={<SaveIcon />}
                onClick={() => setSubmitOpen(true)}
              >
                Submit Changes
                {dirtyCount > 0 && (
                  <span className={classes.changedCount}>{dirtyCount}</span>
                )}
              </Button>
            </div>
          </div>

          <Divider />

          {/* Body: sidebar + editor */}
          <div className={classes.body}>
            <TechDocsFileTree
              nodes={treeNodes}
              selectedPath={selectedPath}
              dirtyPaths={dirtyPaths}
              onSelect={setSelectedPath}
              onCreateFile={handleCreateFile}
            />

            <div className={classes.editorArea}>
              {fileLoading && (
                <div className={classes.noFileSelected}>
                  <CircularProgress size={24} />
                </div>
              )}
              {fileError && <ResponseErrorPanel error={fileError} />}
              {!selectedPath && !fileLoading && (
                <div className={classes.noFileSelected}>
                  <Typography>Select a file to edit</Typography>
                </div>
              )}
              {selectedPath && !fileLoading && !fileError && (
                <TechDocsMarkdownEditor
                  key={selectedPath}
                  initialContent={fileContent}
                  onChange={handleContentChange}
                  sourceMode={sourceMode}
                />
              )}
            </div>
          </div>
        </div>

        <SubmitEditsDialog
          open={submitOpen}
          changedFiles={Array.from(editedFiles.values())}
          onClose={() => setSubmitOpen(false)}
          onSubmit={handleSubmit}
          defaultPrTitle={`docs: update ${
            mkdocsConfig?.site_name ?? entityRef.name
          } documentation`}
        />
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
        // File node
        current.push({
          title: part.replace(/\.md$/, '').replace(/-/g, ' '),
          path: p,
        });
      } else {
        // Directory node
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
