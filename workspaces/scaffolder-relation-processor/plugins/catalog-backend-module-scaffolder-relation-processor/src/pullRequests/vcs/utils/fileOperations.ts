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

import { UrlReaderService } from '@backstage/backend-plugin-api';

/**
 * Fetches repository file tree using UrlReader
 *
 * @param urlReader - UrlReaderService instance
 * @param url - Repository URL (e.g., 'https://github.com/owner/repo/tree/branch/path')
 * @returns Map of file paths to their content
 *
 * @internal
 */
export async function fetchRepoFiles(
  urlReader: UrlReaderService,
  url: string,
): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  try {
    const tree = await urlReader.readTree(url);

    const treeFiles = await tree.files();

    for (const file of treeFiles) {
      try {
        const content = await file.content();
        files.set(file.path, content.toString('utf-8'));
      } catch (error) {
        continue;
      }
    }

    return files;
  } catch (error) {
    throw new Error(`Error fetching repository files: ${error}`);
  }
}

/**
 * Finds common files between template and scaffolded repositories
 *
 * @param templateFiles - Map of template file paths to content
 * @param scaffoldedFiles - Map of scaffolded file paths to content
 * @returns Array of common file paths
 *
 * @internal
 */
export function findCommonFiles(
  templateFiles: Map<string, string>,
  scaffoldedFiles: Map<string, string>,
): string[] {
  return Array.from(templateFiles.keys()).filter(file =>
    scaffoldedFiles.has(file),
  );
}
