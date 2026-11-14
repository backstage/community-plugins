/*
 * Copyright 2021 The Backstage Authors
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

import { Entity } from '@backstage/catalog-model';

import { GITHUB_PROJECT_SLUG_ANNOTATION as COMMON_GITHUB_PROJECT_SLUG_ANNOTATION } from '@backstage-community/plugin-github-common';

/**
 * @public
 * @deprecated Use `GITHUB_PROJECT_SLUG_ANNOTATION` from `@backstage-community/plugin-github-common` instead.
 */
export const GITHUB_PROJECT_SLUG_ANNOTATION =
  COMMON_GITHUB_PROJECT_SLUG_ANNOTATION;

/** @public */
export const isGithubDeploymentsAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[COMMON_GITHUB_PROJECT_SLUG_ANNOTATION],
  );
