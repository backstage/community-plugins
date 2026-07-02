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

import { useState } from 'react';
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { DocTreeNode } from '@backstage-community/plugin-techdocs-editor-common';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: 'auto',
    height: '100%',
  },
  header: {
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  nested: {
    paddingLeft: theme.spacing(3),
  },
  activeItem: {
    backgroundColor: theme.palette.action.selected,
  },
  fileIcon: {
    minWidth: 32,
  },
  newPageBtn: {
    padding: 4,
  },
  dirtyDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
    display: 'inline-block',
    marginLeft: theme.spacing(0.5),
  },
}));

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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Page</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="File path"
          placeholder="e.g. getting-started.md or guides/setup.md"
          helperText={
            error ??
            'Path is relative to the docs directory. Use sub-folders to organise pages.'
          }
          error={!!error}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreate();
          }}
          variant="outlined"
          size="small"
          style={{ marginTop: 8 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={touched && !!(validationError ?? duplicateError)}
        >
          Create
        </Button>
      </DialogActions>
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
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isFile = !!node.path;
  const isDirty = node.path ? dirtyPaths?.has(node.path) : false;
  const isActive = node.path === selectedPath;

  if (hasChildren) {
    return (
      <>
        <ListItem
          button
          style={{ paddingLeft: depth * 16 + 8 }}
          onClick={() => setOpen(!open)}
        >
          <FolderIcon fontSize="small" className={classes.fileIcon} />
          <ListItemText primary={node.title} />
          {open ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children!.map((child: DocTreeNode, idx: number) => (
              <TreeNodeItem
                key={idx}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                dirtyPaths={dirtyPaths}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItem
      button
      style={{ paddingLeft: depth * 16 + 8 }}
      className={isActive ? classes.activeItem : undefined}
      onClick={() => isFile && onSelect(node.path!)}
    >
      <InsertDriveFileIcon fontSize="small" className={classes.fileIcon} />
      <ListItemText
        primary={
          <>
            {node.title}
            {isDirty && (
              <span className={classes.dirtyDot} title="Unsaved changes" />
            )}
          </>
        }
      />
    </ListItem>
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
}: TechDocsFileTreeProps) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const existingPaths = new Set(collectPaths(nodes));

  const handleCreate = (path: string) => {
    setDialogOpen(false);
    onCreateFile?.(path);
  };

  return (
    <div className={classes.root}>
      <div
        className={classes.header}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption">Documentation Files</Typography>
        {onCreateFile && (
          <Tooltip title="New page">
            <IconButton
              size="small"
              className={classes.newPageBtn}
              onClick={() => setDialogOpen(true)}
              aria-label="Create new page"
            >
              <NoteAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <NewPageDialog
        open={dialogOpen}
        existingPaths={existingPaths}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
      <List dense component="nav">
        {nodes.map((node, idx) => (
          <TreeNodeItem
            key={idx}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            dirtyPaths={dirtyPaths}
            onSelect={onSelect}
          />
        ))}
      </List>
    </div>
  );
}
