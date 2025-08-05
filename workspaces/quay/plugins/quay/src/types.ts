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
  page: number;
  has_additional: boolean;
  tags: Tag[];
}

export interface Tag {
  name: string;
  is_manifest_list: boolean;
  last_modified: string;
  manifest_digest: string;
  reversion: boolean;
  size: number;
  start_ts?: number;
  end_ts?: number;
  manifest_list?: ManifestList;
  expiration?: string;
}

export interface LabelsResponse {
  labels: Label[];
}
export interface QuayTagData {
  id: string;
  name: string;
  last_modified: string;
  size: string;
  rawSize: number;
  manifest_digest: React.JSX.Element;
  expiration?: string;
  securityDetails: Layer;
  securityStatus: string;
  manifest_digest_raw: string;
}
export interface Label {
  id: string;
  key: string;
  value: string;
  source_type: string;
  media_type: string;
}

export interface ManifestList {
  schemaVersion: number;
  mediaType: string;
  manifests: Manifest[];
}

export interface Manifest {
  mediaType: string;
  size: number;
  digest: string;
  platform: Platform;
  security: SecurityDetailsResponse;
  layers: Layer[];
}

export interface Platform {
  architecture: string;
  os: string;
  features?: string[];
  variant?: string;
  'os.version'?: string;
}

export interface SecurityDetailsResponse {
  status: 'unsupported' | 'unscanned' | 'scanning' | 'scanned' | 'queued';
  data: Data | null;
}
export interface Data {
  Layer: Layer;
}
export interface Layer {
  Name: string;
  ParentName: string;
  NamespaceName: string;
  IndexedByVersion: number;
  Features: Feature[];
}
export interface Feature {
  Name: string;
  VersionFormat: string;
  NamespaceName: string;
  AddedBy: string;
  Version: string;
  Vulnerabilities?: Vulnerability[];
  BaseScores?: number[];
  CVEIds?: string[];
}

export interface Vulnerability {
  Severity: VulnerabilitySeverity;
  NamespaceName: string;
  Link: string;
  FixedBy: string;
  Description: string;
  Name: string;
  Metadata: VulnerabilityMetadata;
}

export interface VulnerabilityMetadata {
  UpdatedBy: string;
  RepoName: string | null;
  RepoLink: string | null;
  DistroName: string;
  DistroVersion: string;
  NVD: {
    CVSSv3: {
      Vectors: string;
      Score: number | string;
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

export const VulnerabilityOrder = {
  [VulnerabilitySeverity.Critical]: 0,
  [VulnerabilitySeverity.High]: 1,
  [VulnerabilitySeverity.Medium]: 2,
  [VulnerabilitySeverity.Low]: 3,
  [VulnerabilitySeverity.Negligible]: 4,
  [VulnerabilitySeverity.None]: 5,
  [VulnerabilitySeverity.Unknown]: 6,
};

export interface ManifestByDigestResponse {
  digest: string;
  is_manifest_list: boolean;
  manifest_data: string;
  config_media_type: string;
  layers: LayerByDigest[];
  layers_compressed_size: number;
}

export interface LayerByDigest {
  index: number;
  compressed_size: number;
  is_remote: boolean;
  urls: string[] | null;
  command: string[] | null;
  comment: string | null;
  author: string | null;
  blob_digest: string;
  created_datetime: string;
}

export interface VulnerabilityListItem extends Vulnerability {
  PackageName: string;
  CurrentVersion: string;
}
