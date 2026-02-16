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

import { createHash } from 'crypto';
import { preprocessTemplate } from '../template/variables';

/**
 * Creates a hash of file content for comparison
 *
 * @param content - File content to hash
 * @returns SHA-256 hash of the content
 *
 * @internal
 */
function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Compares two files by comparing their hashes
 *
 * @param templateContent - Preprocessed template content (with variables replaced)
 * @param scaffoldedContent - Content from scaffolded file
 * @returns True if files are identical, false if difference found
 *
 * @internal
 */
export function compareFilesByHash(
  templateContent: string,
  scaffoldedContent: string,
): boolean {
  return hashContent(templateContent) === hashContent(scaffoldedContent);
}

/**
 * Finds files that exist only in the template repository
 *
 * @param templateFiles - Map of template file paths to content
 * @param scaffoldedFiles - Map of scaffolded file paths to content
 * @returns Array of file paths that should be added to scaffolded repo
 *
 * @internal
 */
export function findTemplateOnlyFiles(
  templateFiles: Map<string, string>,
  scaffoldedFiles: Map<string, string>,
): string[] {
  return Array.from(templateFiles.keys()).filter(
    file => !scaffoldedFiles.has(file),
  );
}

/**
 * Finds files that exist only in the scaffolded repository
 *
 * @param templateFiles - Map of template file paths to content
 * @param scaffoldedFiles - Map of scaffolded file paths to content
 * @returns Array of file paths that should be removed from scaffolded repo
 *
 * @internal
 */
export function findScaffoldedOnlyFiles(
  templateFiles: Map<string, string>,
  scaffoldedFiles: Map<string, string>,
): string[] {
  return Array.from(scaffoldedFiles.keys()).filter(
    file => !templateFiles.has(file),
  );
}

/**
 * Compares common files and collects files that need updating
 *
 * @param commonFiles - Array of common file paths
 * @param templateFiles - Map of template file paths to content
 * @param scaffoldedFiles - Map of scaffolded file paths to content
 * @returns Map of file paths to preprocessed template content that need updating
 *
 * @internal
 */
export function compareCommonFiles(
  commonFiles: string[],
  templateFiles: Map<string, string>,
  scaffoldedFiles: Map<string, string>,
): Map<string, string> {
  const filesToUpdate = new Map<string, string>();

  if (commonFiles.length === 0) {
    return filesToUpdate;
  }

  for (const file of commonFiles) {
    const templateContent = templateFiles.get(file);
    const scaffoldedContent = scaffoldedFiles.get(file);

    if (!templateContent || !scaffoldedContent) {
      continue;
    }

    // Preprocess template by replacing template variables with scaffolded values
    const preprocessedTemplate = preprocessTemplate(
      templateContent,
      scaffoldedContent,
    );

    const isIdentical = compareFilesByHash(
      preprocessedTemplate,
      scaffoldedContent,
    );

    if (!isIdentical) {
      filesToUpdate.set(file, preprocessedTemplate);
    }
  }

  return filesToUpdate;
}
