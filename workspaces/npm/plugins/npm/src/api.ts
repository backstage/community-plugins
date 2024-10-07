/*
 * Copyright 2024 The Backstage Authors
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

// From https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
export interface NpmRegistryVersion {
  name: string;
  version: string;
  homepage: string;
  description: string;
}

// From https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
export interface NpmRegistryPackage {
  _id: string;
  _rev: string;
  name: string;
  description?: string;
  keywords?: string[];
  license?: string;
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  versions: {
    [version: string]: NpmRegistryVersion;
  };
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
  author?:
    | {
        name: string;
        email: string;
        url: string;
      }
    | string;
  repository?: {
    type: string;
    url: string;
    directory?: string;
  };
  _attachments: {
    [filename: string]: {
      content_type: string;
      data: string;
    };
  };
  readme?: string;
}

const fetchNpmPackage = async (packageName: string | undefined) => {
  if (!packageName) {
    throw new Error('No package name provided');
  }
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch info for package ${packageName}: ${response.status} ${response.statusText}`,
    );
  }
  const json = await response.json();
  return json as NpmRegistryPackage;
};

export const API = {
  fetchNpmPackage,
};
