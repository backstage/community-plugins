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
import { FileFormat } from '../../types';

/**
 * Extract file extension from filename (lowercase, without dot).
 * Uses path.extname semantics: 'file.tar.gz' → 'gz'.
 */
function getFileExtension(fileName: string): string {
  const dotIdx = fileName.lastIndexOf('.');
  if (dotIdx < 0 || dotIdx === fileName.length - 1) return '';
  return fileName.slice(dotIdx + 1).toLowerCase();
}

/**
 * MIME type mapping for O(1) lookup
 */
const MIME_TYPES: Record<string, string> = {
  yaml: 'application/x-yaml',
  yml: 'application/x-yaml',
  json: 'application/json',
  md: 'text/markdown',
  markdown: 'text/markdown',
  pdf: 'application/pdf',
  txt: 'text/plain',
};

/**
 * File format mapping for O(1) lookup
 */
const FILE_FORMATS: Record<string, FileFormat> = {
  yaml: FileFormat.YAML,
  yml: FileFormat.YAML,
  json: FileFormat.JSON,
  md: FileFormat.MARKDOWN,
  markdown: FileFormat.MARKDOWN,
  pdf: FileFormat.PDF,
  txt: FileFormat.TEXT,
};

/**
 * Get MIME type for file upload based on extension
 */
export function getMimeType(fileName: string): string {
  const ext = getFileExtension(fileName);
  return MIME_TYPES[ext] || 'text/plain';
}

/**
 * Detect file format from filename extension
 */
export function detectFileFormat(fileName: string): FileFormat {
  const ext = getFileExtension(fileName);
  return FILE_FORMATS[ext] || FileFormat.TEXT;
}
