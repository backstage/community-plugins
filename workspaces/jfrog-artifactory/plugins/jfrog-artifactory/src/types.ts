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
export interface TagsResponse {
  data: Data;
}

export interface Data {
  versions: Versions;
}

export interface Versions {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  name: string;
  created: Date;
  modified: Date;
  package: Package;
  repos: Repo[];
  licenses: any[];
  size: string;
  stats: Stats;
  vulnerabilities: Vulnerabilities | null;
  files: File[];
}

export interface File {
  name: string;
  lead: boolean;
  size: string;
  md5: string;
  sha1: string;
  sha256: string;
  mimeType: null | string;
}

export interface Package {
  id: string;
}

export interface Repo {
  name: string;
  type: string;
  leadFilePath: string;
}

export interface Stats {
  downloadCount: number;
}

export interface Vulnerabilities {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  unknown: number;
  skipped: number;
}
