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
import { fetchRepoFiles, findCommonFiles } from '../vcs/utils/fileOperations';
import {
  compareCommonFiles,
  findScaffoldedOnlyFiles,
  findTemplateOnlyFiles,
} from './differ';

/**
 * Fetches and compares files between template and scaffolded repositories
 *
 * @param urlReader - UrlReaderService instance
 * @param scaffoldedUrl - Scaffolded repository URL
 * @param templateFiles - Pre-fetched template files
 * @returns Map of files that need creating/updating (string) or deleting (null), or null if error occurs
 *
 * @internal
 */
export async function fetchAndCompareFiles(
  urlReader: UrlReaderService,
  scaffoldedUrl: string,
  templateFiles: Map<string, string>,
): Promise<Map<string, string | null> | null> {
  try {
    const scaffoldedFiles = await fetchRepoFiles(urlReader, scaffoldedUrl);

    const filesToUpdate = new Map<string, string | null>();
    const commonFiles = findCommonFiles(templateFiles, scaffoldedFiles);
    const commonFileUpdates = compareCommonFiles(
      commonFiles,
      templateFiles,
      scaffoldedFiles,
    );

    for (const [filePath, content] of commonFileUpdates.entries()) {
      filesToUpdate.set(filePath, content);
    }

    const templateOnlyFiles = findTemplateOnlyFiles(
      templateFiles,
      scaffoldedFiles,
    );
    for (const file of templateOnlyFiles) {
      const templateContent = templateFiles.get(file);
      if (typeof templateContent === 'string') {
        filesToUpdate.set(file, templateContent);
      }
    }

    const scaffoldedOnlyFiles = findScaffoldedOnlyFiles(
      templateFiles,
      scaffoldedFiles,
    );
    for (const file of scaffoldedOnlyFiles) {
      filesToUpdate.set(file, null);
    }

    return filesToUpdate;
  } catch (error) {
    return null;
  }
}
