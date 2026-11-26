/*
 * Copyright 2022 The Backstage Authors
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
 * Common types and functionalities for the ADR plugin.
 * @packageDocumentation
 */
import { Entity, getEntitySourceLocation } from '@backstage/catalog-model';
import { ScmIntegrationRegistry } from '@backstage/integration';

export * from './search';

/**
 * ADR plugin annotation.
 * @public
 */
export const ANNOTATION_ADR_LOCATION = 'backstage.io/adr-location';

/**
 * Utility function to get the value of an entity ADR annotation.
 * @public
 */
const getAdrLocationDir = (entity: Entity) =>
  entity.metadata.annotations?.[ANNOTATION_ADR_LOCATION]?.trim();

/**
 * Utility function to determine if the given entity has ADRs.
 * @public
 */
export const isAdrAvailable = (entity: Entity) =>
  Boolean(getAdrLocationDir(entity));

const BITBUCKET_SERVER_REPO_PATH =
  /^(.*?\/(?:projects|users)\/[^/]+\/repos\/[^/]+)(\/.*)?$/;
const BITBUCKET_SERVER_FILE_PATH_TYPE = /^\/(?:browse|raw|src)(?:\/|$)/;

/**
 * Bitbucket Server URLs only point at repository content when they include a
 * `/browse/` (or `/raw/`, `/src/`) segment. Entity source locations that point
 * at the repository root without it would otherwise resolve to URLs that the
 * Bitbucket Server URL reader rejects, so add the missing segment.
 */
const getSourceLocationBase = (
  entity: Entity,
  scmIntegration: ScmIntegrationRegistry,
) => {
  const base = getEntitySourceLocation(entity).target;
  if (scmIntegration.byUrl(base)?.type !== 'bitbucketServer') {
    return base;
  }

  const url = new URL(base);
  const match = url.pathname.match(BITBUCKET_SERVER_REPO_PATH);
  if (!match) {
    return base;
  }

  const [, repoPath, rest = ''] = match;
  if (BITBUCKET_SERVER_FILE_PATH_TYPE.test(rest)) {
    return base;
  }

  url.pathname = `${repoPath}/browse${rest || '/'}`;
  return url.toString();
};

/**
 * Utility function to extract the ADR location URL from an entity based off
 * its ADR annotation and relative to the entity source location.
 * @public
 */
export const getAdrLocationUrl = (
  entity: Entity,
  scmIntegration: ScmIntegrationRegistry,
  adrFilePath?: String,
) => {
  if (!isAdrAvailable(entity)) {
    throw new Error(`Missing ADR annotation: ${ANNOTATION_ADR_LOCATION}`);
  }

  let url = getAdrLocationDir(entity)!.replace(/\/$/, '');

  if (adrFilePath) {
    url = `${url}/${adrFilePath}`;
  }

  return scmIntegration.resolveUrl({
    url,
    base: getSourceLocationBase(entity, scmIntegration),
  });
};

/**
 * File path filter function type for ADR filenames
 * @public
 */
export type AdrFilePathFilterFn = (path: string) => boolean;

/**
 * File path filter for MADR filename formats
 * @public
 */
export const madrFilePathFilter: AdrFilePathFilterFn = (path: string) =>
  /^(?:.*\/)?\d{4}-.+\.md$/.test(path);
