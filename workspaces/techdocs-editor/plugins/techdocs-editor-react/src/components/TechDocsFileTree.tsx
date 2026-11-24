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

import { useMemo, useState } from 'react';
import {
  Button,
  ButtonIcon,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
  TextField,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiFileAddLine,
  RiFileLine,
  RiFolderLine,
} from '@remixicon/react';
import { DocTreeNode } from '@backstage-community/plugin-techdocs-editor-common';
import styles from './TechDocsFileTree.module.css';

/** Join a list of class names, dropping falsy values. */
function cx(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(' ');
}

/**
 * Props for {@link TechDocsFileTree}.
 * @public
 */
export type TechDocsFileTreeProps = {
  nodes: DocTreeNode[];
  selectedPath?: string;
  dirtyPaths?: Set<string>;
  onSelect: (path: string) => void;
  /** Called with the new relative file path (e.g. "guide/setup.md") when the user creates a page */
  onCreateFile?: (path: string) => void;
  /** Branch the docs were loaded from, shown in the empty state for context */
  branch?: string;
  /** Resolved docs directory, shown in the empty state for context */
  docsDir?: string;
};

/** Validates a new page path entered by the user. */
function validateNewPath(raw: string): string | undefined {
  const p = raw.trim();
  if (!p) return 'Please enter a file name.';
  if (!/^[a-zA-Z0-9_\-./]+\.md$/.test(p))
    return 'Path must end with .md and contain only letters, numbers, hyphens, underscores, dots, or slashes.';
  if (p.startsWith('/') || p.includes('../'))
    return 'Path must be relative and must not escape the docs directory.';
  return undefined;
}

/** Dialog for creating a new markdown page. */
function NewPageDialog({
  open,
  existingPaths,
  onClose,
  onCreate,
}: {
  open: boolean;
  existingPaths: Set<string>;
  onClose: () => void;
  onCreate: (path: string) => void;
}) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const validationError = validateNewPath(value);
  const duplicateError =
    !validationError && existingPaths.has(value.trim())
      ? 'A file with that path already exists.'
      : undefined;
  const error = touched ? validationError ?? duplicateError : undefined;

  const handleCreate = () => {
    setTouched(true);
    if (validationError || duplicateError) return;
    onCreate(value.trim());
    setValue('');
    setTouched(false);
  };

  const handleClose = () => {
    setValue('');
    setTouched(false);
    onClose();
  };

  return (
    <Dialog
      isOpen={open}
      onOpenChange={o => {
        if (!o) handleClose();
      }}
      width={600}
    >
      <DialogHeader>Create New Page</DialogHeader>
      <DialogBody>
        <TextField
          label="File path"
          placeholder="e.g. getting-started.md or guides/setup.md"
          description={
            !error
              ? 'Path is relative to the docs directory. Use sub-folders to organise pages.'
              : undefined
          }
          value={value}
          onChange={setValue}
          onBlur={() => setTouched(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreate();
          }}
        />
        {error && (
          <Text color="danger" variant="body-x-small">
            {error}
          </Text>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onPress={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={handleCreate}
          isDisabled={touched && !!(validationError ?? duplicateError)}
        >
          Create
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

type TreeNodeProps = {
  node: DocTreeNode;
  depth: number;
  selectedPath?: string;
  dirtyPaths?: Set<string>;
  onSelect: (path: string) => void;
};

function TreeNodeItem({
  node,
  depth,
  selectedPath,
  dirtyPaths,
  onSelect,
}: TreeNodeProps) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isFile = !!node.path;
  const isDirty = node.path ? dirtyPaths?.has(node.path) : false;
  const isActive = node.path === selectedPath;

  if (hasChildren) {
    return (
      <>
        <button
          type="button"
          className={styles.row}
          style={{ paddingLeft: depth * 16 + 8 }}
          onClick={() => setOpen(!open)}
        >
          <RiFolderLine size={16} className={styles.icon} />
          <span className={styles.label}>{node.title}</span>
          {open ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
        </button>
        {open &&
          node.children!.map((child: DocTreeNode, idx: number) => (
            <TreeNodeItem
              key={child.path ?? child.title ?? idx}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              dirtyPaths={dirtyPaths}
              onSelect={onSelect}
            />
          ))}
      </>
    );
  }

  return (
    <button
      type="button"
      className={cx(styles.row, isActive && styles.rowActive)}
      style={{ paddingLeft: depth * 16 + 8 }}
      onClick={() => isFile && onSelect(node.path!)}
    >
      <RiFileLine size={16} className={styles.icon} />
      <span className={styles.label}>
        {node.title}
        {isDirty && (
          <span className={styles.dirtyDot} title="Unsaved changes" />
        )}
      </span>
    </button>
  );
}

/** Collect all leaf file paths from a tree. */
function collectPaths(nodes: DocTreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.path) paths.push(node.path);
    if (node.children) paths.push(...collectPaths(node.children));
  }
  return paths;
}

/**
 * A sidebar file tree showing the documentation structure.
 * @public
 */
export function TechDocsFileTree({
  nodes,
  selectedPath,
  dirtyPaths,
  onSelect,
  onCreateFile,
  branch,
  docsDir,
}: TechDocsFileTreeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const existingPaths = useMemo(() => new Set(collectPaths(nodes)), [nodes]);

  const handleCreate = (path: string) => {
    setDialogOpen(false);
    onCreateFile?.(path);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Text variant="body-x-small">Documentation Files</Text>
        {onCreateFile && (
          <TooltipTrigger>
            <ButtonIcon
              variant="tertiary"
              size="small"
              icon={<RiFileAddLine size={16} />}
              aria-label="Create new page"
              onPress={() => setDialogOpen(true)}
            />
            <Tooltip>New page</Tooltip>
          </TooltipTrigger>
        )}
      </div>
      <NewPageDialog
        open={dialogOpen}
        existingPaths={existingPaths}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
      {nodes.length === 0 ? (
        <div className={styles.emptyState}>
          <Text variant="body-small" color="secondary" as="div">
            No documentation files found
            {docsDir && docsDir !== '.' ? ` in “${docsDir}”` : ''}
            {branch ? ` on “${branch}”` : ''}.
          </Text>
          <Text variant="body-x-small" color="secondary" as="div">
            Check the entity's <code>backstage.io/techdocs-ref</code> annotation
            and that the docs directory exists.
            {onCreateFile
              ? ' Use the + button above to create the first page.'
              : ''}
          </Text>
        </div>
      ) : (
        <div role="tree">
          {nodes.map((node, idx) => (
            <TreeNodeItem
              key={node.path ?? node.title ?? idx}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              dirtyPaths={dirtyPaths}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
