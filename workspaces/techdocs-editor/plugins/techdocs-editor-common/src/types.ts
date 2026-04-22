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

/**
 * A single documentation file.
 * @public
 */
export type DocFile = {
  /** Relative path inside docs_dir, e.g. "getting-started.md" */
  path: string;
  /** Raw markdown content */
  content: string;
  /** Source ETag (commit SHA or HTTP ETag) for conflict detection */
  etag: string;
};

/**
 * A node in the documentation file tree.
 * @public
 */
export type DocTreeNode = {
  /** Display label (from mkdocs.yml nav title or filename) */
  title: string;
  /** Relative file path inside docs_dir. Undefined for section nodes. */
  path?: string;
  children?: DocTreeNode[];
};

/**
 * The file tree for a documentation source.
 * @public
 */
export type DocTree = {
  nodes: DocTreeNode[];
  /** The etag of the overall source at the time the tree was fetched */
  sourceEtag: string;
};

/**
 * Parsed subset of mkdocs.yml relevant to the editor.
 * @public
 */
export type MkDocsConfig = {
  site_name: string;
  docs_dir: string;
  repo_url?: string;
  edit_uri?: string;
  nav?: MkDocsNavEntry[];
};

/** @public */
export type MkDocsNavEntry = string | Record<string, string | MkDocsNavEntry[]>;

/**
 * A changed file to include in the PR/MR.
 * @public
 */
export type EditedFile = {
  /** Relative path inside docs_dir */
  path: string;
  /** New content. null means delete the file. */
  content: string | null;
  /** ETag of the version the user was editing — used for conflict detection */
  etag: string;
};

/**
 * Request body for POST /submissions/:namespace/:kind/:name
 * @public
 */
export type SubmitEditsRequest = {
  files: EditedFile[];
  commitMessage: string;
  prTitle: string;
  prDescription?: string;
  draft?: boolean;
  /** Override the base branch (default: repo default branch) */
  baseBranch?: string;
};

/**
 * Successful response from POST /submissions
 * @public
 */
export type SubmitEditsResponse = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  headBranch: string;
};

/**
 * A file conflict detected when the source changed between open and submit.
 * @public
 */
export type FileConflict = {
  path: string;
  /** The etag the user had when they started editing */
  userEtag: string;
  /** The current etag in the remote repository */
  currentEtag: string;
};
