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
import { Entity } from '@backstage/catalog-model';
import { isJenkinsAvailable } from '@backstage-community/plugin-jenkins';
import { isGithubActionsAvailable } from '@backstage-community/plugin-github-actions';
import { isGitlabAvailable } from '@immobiliarelabs/backstage-plugin-gitlab';
import { isAzurePipelinesAvailable } from '@backstage-community/plugin-azure-devops';
import { MSSV_ENABLED_ANNOTATION } from '@backstage-community/plugin-multi-source-security-viewer-common';

/**
 * @public
 * Returns true if the CI provider annotations are set on component.
 */
export const isMultiCIAvailable = (entity: Entity): boolean =>
  isJenkinsAvailable(entity) ||
  isGitlabAvailable(entity) ||
  isGithubActionsAvailable(entity) ||
  isAzurePipelinesAvailable(entity);

/**
 * @public
 * Returns true if CI provider and mssv annotations are set on component.
 */
export const isMultiCIAvailableAndEnabled = (entity: Entity): boolean =>
  Boolean(
    entity.metadata.annotations?.[MSSV_ENABLED_ANNOTATION] === 'true' &&
      isMultiCIAvailable(entity),
  );
