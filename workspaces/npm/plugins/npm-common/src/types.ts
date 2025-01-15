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

/**
 * NPM package info `versions` type definition based on https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
 *
 * @public
 */
export interface NpmRegistryPackageInfoVersion {
  name: string;
  version: string;
  homepage: string;
  description: string;
}

/**
 * NPM registry package info type definition based on https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
 *
 * @public
 */
export interface NpmRegistryPackageInfo {
  _id: string;
  _rev: string;
  name: string;
  description?: string;
  keywords?: string[];
  license?: string;
  'dist-tags': {
    [tag: string]: string;
  };
  versions: {
    [version: string]: NpmRegistryPackageInfoVersion;
  };
  // Available on npmjs and GitHub, not available on GitLab
  time?: {
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
  homepage?: string;
  repository?: {
    type: string;
    url: string;
    directory?: string;
  };
  bugs?: {
    url?: string;
  };
  _attachments?: {
    [filename: string]: {
      content_type: string;
      data: string;
    };
  };
  readme?: string;
}
