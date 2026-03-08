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

import * as path from 'path';

import type { FetchedDocument, FileAttributes } from '../../types';

/**
 * Generate a human-readable title from a filename.
 * Removes extension and converts separators to spaces.
 */
export function generateTitleFromFileName(fileName: string): string {
  return (
    fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || fileName
  );
}

/**
 * Detect content type based on file extension.
 */
export function detectContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.md':
      return 'markdown';
    case '.pdf':
      return 'pdf-documentation';
    case '.txt':
      return 'text';
    case '.yaml':
    case '.yml':
      return 'yaml';
    case '.json':
      return 'json';
    case '.html':
    case '.htm':
      return 'html';
    default:
      return 'text';
  }
}

/**
 * Generate default attributes for a document based on its source metadata.
 * Used when FetchedDocument doesn't have explicit attributes.
 */
export function generateDefaultAttributes(
  doc: FetchedDocument,
): FileAttributes {
  const title = generateTitleFromFileName(doc.fileName) || doc.fileName;
  const detectedContentType = detectContentType(doc.fileName);
  const contentType =
    detectedContentType === 'text' ? doc.sourceType : detectedContentType;

  return {
    title,
    source_url: doc.sourceId,
    content_type: contentType,
  };
}

/**
 * Extract filename from a URL, falling back to `'document.txt'`.
 */
export function extractFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = path.basename(pathname);
    return fileName || 'document.txt';
  } catch {
    // Path parsing failed; return safe default filename
    return 'document.txt';
  }
}
