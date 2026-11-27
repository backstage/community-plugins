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
import { SearchService } from './generated';
import type {
  AssetXO as AssetXOBase,
  ComponentXO as ComponentXOBase,
} from './generated';

export type SearchServiceQuery = Parameters<typeof SearchService.search>[0];

export type Annotation = {
  annotation: string;
  query?: (str: string) => SearchServiceQuery;
};

export type AssetHash = {
  algorithm: 'sha256' | 'sha1';
  value: string;
};

export type DockerManifest = DockerManifestSchema1 | DockerManifestSchema2;

/**
 * OpenAPI spec doesn't include some optional fields, so we add them manually.
 * @see {@link https://help.sonatype.com/repomanager3/integrations/rest-and-integration-api/assets-api#AssetsAPI-GetAsset|Get Asset}
 * TODO: The docs example doesn't have all fields that can be present; what
 * else is possible?
 */
export type AssetXO = AssetXOBase & {
  maven2?: {
    artifactId?: string;
    groupId?: string;
    version?: string;
    extension?: string;
    classifier?: string;
    baseVersion?: string;
    asset_kind?: string;
  };
};

export type ComponentXO = Omit<ComponentXOBase, 'assets'> & {
  assets?: Array<AssetXO>;
};

/** @see {@link https://docs.docker.com/registry/spec/manifest-v2-1/|Image Manifest Version 2, Schema 1} */
export type DockerManifestSchema1 = {
  schemaVersion: 1;
  name: string;
  tag: string;
  architecture: string;
  fsLayers: LayerSchema1[];
  history: HistorySchema1[];
};

export type LayerSchema1 = {
  blobSum: string;
};

export type HistorySchema1 = {
  v1Compatibility: string;
};

/** @see {@link https://docs.docker.com/registry/spec/manifest-v2-2/|Image Manifest Version 2, Schema 2} */
export type DockerManifestSchema2 = {
  schemaVersion: 2;
  mediaType: 'application/vnd.docker.distribution.manifest.v2+json';
  config: ConfigSchema2;
  layers: LayerSchema2[];
};

export type ConfigSchema2 = {
  mediaType: string;
  size: number;
  digest: string;
};

export type LayerSchema2 = {
  mediaType: string;
  size: number;
  digest: string;
};
