/*
 * Copyright 2026 The Backstage Authors
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
import { match } from 'path-to-regexp';

const AZURE_HOST_NAME = 'dev.azure.com';

export function extractRepoUrlFromSourceLocation(
  sourceLocation?: string,
): string | null {
  try {
    if (!sourceLocation) {
      return null;
    }

    // Extract the base URL (remove "url:" prefix if present)
    const cleanUrl = sourceLocation.replace(/^url:/, '');
    const matches = cleanUrl.match(
      /https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/.*)?/g,
    );

    if (!matches) {
      return null;
    }
    const url = new URL(matches[0]);
    const hostname = url.host.toLowerCase();

    // Handle different SCM providers using path-to-regexp patterns
    let repoPath: string | null = null;
    if (hostname === AZURE_HOST_NAME) {
      // Azure DevOps format: /org/project/_git/repo
      const matcher = match('/:org/:project/_git/:repo', { end: false });
      const extracted = matcher(url.pathname);
      if (extracted) {
        repoPath = `/${extracted.params.org}/${extracted.params.project}/_git/${extracted.params.repo}`;
      }
    } else if (hostname.includes('gitlab')) {
      // GitLab format: /org/repo or /group/subgroup/.../repo
      // Remove GitLab-specific parts like /-/tree/branch
      const cleanPath = url.pathname.replace(/\/-\/(tree|blob)\/[^\/]+.*$/, '');

      // Use a pattern that matches any number of segments between org and repo
      const matcher = match('/:org/:repo', { end: false });
      const extracted = matcher(cleanPath);

      if (extracted) {
        // For GitLab, preserve the full path structure to support subgroups
        repoPath = cleanPath;
      }
    } else {
      // GitHub and Bitbucket format: /org/repo
      const matcher = match('/:org/:repo', { end: false });
      const extracted = matcher(url.pathname);
      if (extracted) {
        repoPath = `/${extracted.params.org}/${extracted.params.repo}`;
      }
    }

    return repoPath ? `${url.protocol}//${hostname}${repoPath}` : null;
  } catch (error) {
    return null;
  }
}
