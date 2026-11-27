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

import { ANNOTATION_SOURCE_LOCATION, Entity } from '@backstage/catalog-model';
import {
  getAnnotationValuesFromEntity,
  parseAzureDevOpsSourceLocation,
} from './getAnnotationValuesFromEntity';

const DEFAULT_README_PATH = 'README.md';
const VERSION_SEPARATOR = '&version=';

/**
 * Resolves the README file path and version for an entity from its
 * annotations: `dev.azure.com/readme-path` (optionally suffixed with
 * `&version=`), then `backstage.io/source-location`, then `README.md` in the
 * repository root. Only Markdown files are allowed.
 *
 * @public
 */
export function getReadmeLocation(entity: Entity): {
  path: string;
  version?: string;
} {
  const { readmePath } = getAnnotationValuesFromEntity(entity);

  if (readmePath && /^\.\.?(\/|$)/.test(readmePath)) {
    throw new Error(
      `The "dev.azure.com/readme-path" annotation does not support relative paths, please correct this annotation. The value provided was: "${readmePath}"`,
    );
  }

  let path = readmePath || DEFAULT_README_PATH;
  let version: string | undefined;

  if (path.includes(VERSION_SEPARATOR)) {
    const versionIndex = path.indexOf(VERSION_SEPARATOR);
    version = path.slice(versionIndex + VERSION_SEPARATOR.length);
    path = path.slice(0, versionIndex);
  }

  // Only Markdown files are served, so the annotation cannot be used to
  // expose other files from the repository
  if (!/\.md$/i.test(path)) {
    throw new Error(
      `The "dev.azure.com/readme-path" annotation must point to a Markdown (.md) file. The value provided was: "${path}"`,
    );
  }

  const sourceLocation =
    entity.metadata.annotations?.[ANNOTATION_SOURCE_LOCATION];
  if (sourceLocation && !version) {
    version =
      parseAzureDevOpsSourceLocation(sourceLocation)?.searchParams.get(
        'version',
      ) ?? undefined;
  }

  return { path, version };
}
