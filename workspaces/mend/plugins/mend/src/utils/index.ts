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

import { Entity } from '@backstage/catalog-model';

export const MEND_PROJECT_ANNOTATION = 'mend.io/project-ids';
/**
 * Checks if a Mend project is available for the given entity.
 * Returns true if the entity has the mend.io/project-ids annotation configured.
 *
 * @public
 */
export const isMendProjectAvailable = (entity: Entity): boolean => {
  return !!entity.metadata.annotations?.[MEND_PROJECT_ANNOTATION];
};
export const dateTimeFormat = (date: number | string, locales = 'en-US') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locales, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });
};

export const numberToShortText = (num: number = 0): string => {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(1).replace(/\.0$/, '')}T`;
  } else if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toString();
};

export const getObjValue = (t: Record<string, any>, path: string): unknown =>
  path.split('.').reduce((r, k) => r?.[k], t);

export { isMendBackendNotInstalled } from './errorUtils';
