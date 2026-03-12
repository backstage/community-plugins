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

import type { DocumentInfo } from '@backstage-community/plugin-agentic-chat-common';

/**
 * Directory source - local file system
 * @public
 */
export interface DirectorySource {
  type: 'directory';
  /** Path to the directory (relative to Backstage root or absolute) */
  path: string;
  /** Glob patterns to match files (e.g., '**\/*.md') */
  patterns?: string[];
}

/**
 * URL source - fetch documents from URLs
 * @public
 */
export interface UrlSource {
  type: 'url';
  /** List of URLs to fetch documents from */
  urls: string[];
  /** Optional headers for authentication */
  headers?: Record<string, string>;
}

/**
 * GitHub repository source
 * @public
 */
export interface GitHubSource {
  type: 'github';
  /** Repository in format 'owner/repo' */
  repo: string;
  /** Branch to fetch from (default: main) */
  branch?: string;
  /** Path within the repository (default: root) */
  path?: string;
  /** Glob patterns to match files */
  patterns?: string[];
  /** GitHub token for private repos */
  token?: string;
}

/**
 * Union type for all document sources
 * @public
 */
export type DocumentSource = DirectorySource | UrlSource | GitHubSource;

/**
 * Document ingestion configuration
 * @public
 */
export interface DocumentsConfig {
  /** Sync mode: 'full' syncs all (add new, remove deleted), 'append' only adds new */
  syncMode: 'full' | 'append';
  /** How often to sync documents (cron expression or duration like '1h', '30m') */
  syncSchedule?: string;
  /** Document sources to ingest */
  sources: DocumentSource[];
}

/**
 * File attributes for RAG citation metadata
 * Attached to files during upload and returned in search results
 * @public
 */
export interface FileAttributes {
  /** Document title for display in citations */
  title?: string;
  /** Source URL for clickable citations (e.g., GitHub URL, documentation link) */
  source_url?: string;
  /** Content type classification (e.g., 'markdown', 'pdf-documentation', 'workshop-content') */
  content_type?: string;
  /** Module or category grouping */
  module?: string;
  /** Allow custom attributes */
  [key: string]: string | undefined;
}

/**
 * A fetched document ready for upload
 * @internal
 */
export interface FetchedDocument {
  /** Unique identifier for tracking (used for sync) */
  sourceId: string;
  /** File name for the document */
  fileName: string;
  /** Content of the document */
  content: string;
  /** Source type this came from */
  sourceType: 'directory' | 'url' | 'github';
  /** Content hash for change detection (computed during fetch) */
  contentHash?: string;
  /** Metadata attributes for RAG citations */
  attributes?: FileAttributes;
}

/**
 * Request to upload documents
 * @public
 */
export interface UploadDocumentsRequest {
  files: Array<{
    fileName: string;
    content: string;
  }>;
}

/**
 * Response from upload documents endpoint
 * @public
 */
export interface UploadDocumentsResponse {
  success: boolean;
  uploaded: DocumentInfo[];
  failed: Array<{
    fileName: string;
    error: string;
  }>;
}
