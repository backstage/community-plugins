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

export interface Tag {
  name: string;
  isManifestList: boolean;
  lastModified: string;
  manifestDigest: string;
  reversion: boolean;
  size: number;
  startTs?: number;
  endTs?: number;
  manifestList?: ManifestList;
  expiration?: string;
}

export interface TagsResponse {
  page: number;
  hasAdditional: boolean;
  tags: Tag[];
}

export interface Label {
  id: string;
  key: string;
  value: string;
  sourceType: string;
  mediaType: string;
}

export interface LabelsResponse {
  labels: Label[];
}

export interface Platform {
  architecture: string;
  os: string;
  features?: string[];
  variant?: string;
  osVersion?: string;
}

export interface VulnerabilityMetadata {
  updateBy: string;
  repoName: string | null;
  repoLink: string | null;
  distroName: string;
  distroVersion: string;
  nvd: {
    cvssV3: {
      vectors: string;
      score: number | string;
    };
  };
}

export enum VulnerabilitySeverity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Negligible = 'Negligible',
  None = 'None',
  Unknown = 'Unknown',
}

export interface Vulnerability {
  severity: VulnerabilitySeverity;
  namespaceName: string;
  link: string;
  fixedBy: string;
  description: string;
  name: string;
  metadata: VulnerabilityMetadata;
}

export interface VulnerabilityListItem extends Vulnerability {
  packageName: string;
  currentVersion: string;
}

export interface Feature {
  name: string;
  versionFormat: string;
  namespaceName: string;
  addedBy: string;
  version: string;
  vulnerabilities: Vulnerability[];
  baseScores?: number[];
  cveIds?: string[];
}

export interface Layer {
  name: string;
  parentName: string;
  namespaceName: string;
  indexedByVersion: number;
  features: Feature[];
}

export interface SecurityData {
  layer: Layer;
}

export interface SecurityDetailsResponse {
  status: 'unsupported' | 'unscanned' | 'scanning' | 'scanned' | 'queued';
  data: SecurityData | null;
}

export interface Manifest {
  mediaType: string;
  size: number;
  digest: string;
  platform: Platform;
  security: SecurityDetailsResponse;
  layers: Layer[];
}

export interface ManifestList {
  schemaVersion: number;
  mediaType: string;
  manifests: Manifest[];
}

export interface LayerByDigest {
  index: number;
  compressedSize: number;
  isRemote: boolean;
  urls: string[] | null;
  command: string[] | null;
  comment: string | null;
  author: string | null;
  blobDigest: string;
  createdDatetime: string;
}

export interface ManifestByDigestResponse {
  digest: string;
  isManifestList: boolean;
  manifestData: string;
  configMediaType: string;
  layers: LayerByDigest[];
  layersCompressedSize: number;
}
