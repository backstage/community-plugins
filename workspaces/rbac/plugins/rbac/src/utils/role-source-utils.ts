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
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import { rbacTranslationRef } from '../alpha/translations';

export const ROLE_SOURCE_REST = 'rest';
export const ROLE_SOURCE_CSV = 'csv-file';
export const ROLE_SOURCE_CONFIGURATION = 'configuration';
export const ROLE_SOURCE_LEGACY = 'legacy';

/** Roles created via REST/UI can be edited and deleted in the RBAC UI. */
export const isRoleEditableInUI = (source?: string): boolean =>
  source === ROLE_SOURCE_REST;

export const getRoleSourceLabel = (
  source: string | undefined,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): string => {
  switch (source) {
    case ROLE_SOURCE_CONFIGURATION:
      return t('table.sources.appConfig');
    case ROLE_SOURCE_CSV:
      return t('table.sources.csv');
    case ROLE_SOURCE_REST:
      return t('table.sources.form');
    case ROLE_SOURCE_LEGACY:
      return t('table.sources.legacy');
    default:
      return source?.trim() ? source : t('table.sources.legacy');
  }
};

/** Tooltip describing where a role is defined / how it is managed. */
export const getRoleSourceTooltip = (
  source: string | undefined,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): string => {
  switch (source) {
    case ROLE_SOURCE_CONFIGURATION:
      return t('table.sources.tooltips.appConfig');
    case ROLE_SOURCE_CSV:
      return t('table.sources.tooltips.csv');
    case ROLE_SOURCE_REST:
      return t('table.sources.tooltips.form');
    case ROLE_SOURCE_LEGACY:
      return t('table.sources.tooltips.legacy');
    default:
      return source?.trim()
        ? t('table.sources.tooltips.generic')
        : t('table.sources.tooltips.legacy');
  }
};

/** Tooltip explaining why a non-REST role cannot be changed in the UI. */
export const getRoleSourceActionTooltip = (
  source: string | undefined,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): string | undefined => {
  switch (source) {
    case ROLE_SOURCE_CONFIGURATION:
      return t('table.sources.actionTooltips.appConfig');
    case ROLE_SOURCE_CSV:
      return t('table.sources.actionTooltips.csv');
    case ROLE_SOURCE_LEGACY:
      return t('table.sources.actionTooltips.legacy');
    case ROLE_SOURCE_REST:
      return undefined;
    default:
      return t('table.sources.actionTooltips.generic');
  }
};
