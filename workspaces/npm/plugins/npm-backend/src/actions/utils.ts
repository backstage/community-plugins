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
import { BackstageCredentials } from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { ConflictError, NotFoundError } from '@backstage/errors';
import { CatalogService } from '@backstage/plugin-catalog-node';

import {
  NpmAnnotation,
  NpmRegistryPackageInfo,
} from '@backstage-community/plugin-npm-common';

import { NpmRegistryService } from '../services';

export type EntityInput = {
  name: string;
  kind?: string;
  namespace?: string;
};

/**
 * The zod instance that is passed to the action schema factories.
 */
type Zod = Parameters<
  Parameters<ActionsRegistryService['register']>[0]['schema']['input']
>[0];

/**
 * Input schema fields shared by all npm actions to identify a catalog entity.
 */
export function entityInputSchema(zod: Zod) {
  return {
    name: zod
      .string()
      .trim()
      .min(1)
      .describe('The name of the catalog entity.'),
    kind: zod
      .string()
      .min(1)
      .optional()
      .describe(
        'The kind of the catalog entity, e.g. "Component", "API", "System". If the kind is unknown it can be omitted.',
      ),
    namespace: zod
      .string()
      .min(1)
      .optional()
      .describe(
        'The namespace of the catalog entity. If the namespace is unknown it can be omitted.',
      ),
  };
}

/**
 * Resolves the catalog entity for the action input the same way the
 * core catalog actions do: by name, narrowed down by kind and namespace
 * if they are provided.
 */
export async function resolveEntity(options: {
  catalog: CatalogService;
  input: EntityInput;
  credentials: BackstageCredentials;
}): Promise<Entity> {
  const { catalog, input, credentials } = options;

  const filter: Record<string, string> = { 'metadata.name': input.name };
  if (input.kind) {
    filter.kind = input.kind;
  }
  if (input.namespace) {
    filter['metadata.namespace'] = input.namespace;
  }

  const { items } = await catalog.queryEntities({ filter }, { credentials });

  if (items.length === 0) {
    throw new NotFoundError(`No entity found with name '${input.name}'`);
  }
  if (items.length > 1) {
    throw new ConflictError(
      `Multiple entities found with name '${
        input.name
      }', please provide a more specific kind and/or namespace. Matching entities: ${items
        .map(e => stringifyEntityRef(e))
        .join(', ')}`,
    );
  }
  return items[0];
}

/**
 * Resolves the catalog entity for the action input and loads the npm package
 * info from the registry that is configured for that entity.
 */
export async function loadPackageInfo(options: {
  catalog: CatalogService;
  npmRegistryService: NpmRegistryService;
  input: EntityInput;
  credentials: BackstageCredentials;
}): Promise<{
  entity: Entity;
  entityRef: string;
  packageName: string;
  packageInfo: NpmRegistryPackageInfo;
}> {
  const { catalog, npmRegistryService, input, credentials } = options;

  const entity = await resolveEntity({ catalog, input, credentials });
  const entityRef = stringifyEntityRef(entity);

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];
  if (!packageName) {
    throw new NotFoundError(
      `Npm package name not defined at entity '${entityRef}'`,
    );
  }

  const packageInfo = await npmRegistryService.getPackageInfoForEntity(entity);

  return { entity, entityRef, packageName, packageInfo };
}

/**
 * Returns the dist-tags of a package as a list, optionally filtered by the
 * `npm/show-tags` annotation of the entity, including the publish date of
 * the tagged version when the registry provides it.
 */
export function getTags(
  entity: Entity,
  packageInfo: NpmRegistryPackageInfo,
): Array<{ tag: string; version: string; publishedAt?: string }> {
  const showTags = entity.metadata.annotations?.[NpmAnnotation.SHOW_TAGS]
    ?.split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return Object.entries(packageInfo['dist-tags'] ?? {})
    .filter(([tag]) => !showTags?.length || showTags.includes(tag))
    .map(([tag, version]) => ({
      tag,
      version,
      publishedAt: packageInfo.time?.[version],
    }));
}

/**
 * Returns all published versions of a package, newest first.
 *
 * Registries like npmjs and GitHub provide a `time` map with the publish
 * date per version. Other registries (e.g. GitLab) don't, in which case
 * the order of the `versions` map is used as fallback.
 */
export function getVersions(
  packageInfo: NpmRegistryPackageInfo,
): Array<{ version: string; publishedAt?: string; tags: string[] }> {
  const tagsByVersion: Record<string, string[]> = {};
  for (const [tag, version] of Object.entries(packageInfo['dist-tags'] ?? {})) {
    (tagsByVersion[version] ??= []).push(tag);
  }

  let versions: Array<{ version: string; publishedAt?: string }>;
  if (packageInfo.time) {
    versions = Object.entries(packageInfo.time)
      .filter(([version]) => version !== 'created' && version !== 'modified')
      .map(([version, publishedAt]) => ({ version, publishedAt }))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } else {
    versions = Object.keys(packageInfo.versions ?? {})
      .reverse()
      .map(version => ({ version }));
  }

  return versions.map(v => ({ ...v, tags: tagsByVersion[v.version] ?? [] }));
}
