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
import { GitHub } from '@mui/icons-material';
import { Azure } from '../assets/providerIcons/Azure';
import { Bitbucket } from '../assets/providerIcons/Bitbucket';
import { Gitlab } from '../assets/providerIcons/Gitlab';
import type { Entity } from '@backstage/catalog-model';
import {
  APIIRO_PROJECT_ANNOTATION,
  APIIRO_METRICS_VIEW_ANNOTATION,
} from '@backstage-community/plugin-apiiro-common';

export const scmProviderIcons: Record<string, any> = {
  AzureDevops: Azure,
  AzureDevopsServer: Azure,
  BitbucketCloud: Bitbucket,
  BitbucketServer: Bitbucket,
  Github: GitHub,
  GithubEnterprise: GitHub,
  Gitlab: Gitlab,
  GitlabServer: Gitlab,
};

/**
 * Formats a date string to a locale-specific date format.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const userLocale =
    window.navigator.language || window.navigator.languages?.[0] || 'en-US';
  return date.toLocaleDateString(userLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * @public
 * Checks if the entity has the APIIRO project annotation.
 */
export const isApiiroRepoAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[APIIRO_PROJECT_ANNOTATION]);

/**
 * @public
 * Checks if the entity has the APIIRO project annotation.
 */
export const isApiiroMetricViewAvailable = (entity: Entity) =>
  entity.metadata.annotations?.[APIIRO_METRICS_VIEW_ANNOTATION] === 'true';

/**
 * @public
 * Checks if the entity has both the APIIRO project annotation and the APIIRO metrics view annotation.
 */
export const isApiiroWidgetAllowed = (entity: Entity) =>
  isApiiroRepoAvailable(entity) && isApiiroMetricViewAvailable(entity);
