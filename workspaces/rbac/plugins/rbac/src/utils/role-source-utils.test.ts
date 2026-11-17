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
import {
  getRoleSourceActionTooltip,
  getRoleSourceLabel,
  getRoleSourceTooltip,
  isRoleEditableInUI,
} from './role-source-utils';

const t = ((key: string) => key) as unknown as TranslationFunction<
  typeof rbacTranslationRef.T
>;

describe('role-source-utils', () => {
  it('only treats rest/UI roles as editable', () => {
    expect(isRoleEditableInUI('rest')).toBe(true);
    expect(isRoleEditableInUI('configuration')).toBe(false);
    expect(isRoleEditableInUI('csv-file')).toBe(false);
    expect(isRoleEditableInUI('legacy')).toBe(false);
    expect(isRoleEditableInUI(undefined)).toBe(false);
  });

  it('returns user-facing labels for known sources', () => {
    expect(getRoleSourceLabel('configuration', t)).toBe(
      'table.sources.appConfig',
    );
    expect(getRoleSourceLabel('csv-file', t)).toBe('table.sources.csv');
    expect(getRoleSourceLabel('rest', t)).toBe('table.sources.form');
    expect(getRoleSourceLabel('legacy', t)).toBe('table.sources.legacy');
    expect(getRoleSourceLabel(undefined, t)).toBe('table.sources.legacy');
  });

  it('returns source-specific tooltips for each known source', () => {
    expect(getRoleSourceTooltip('configuration', t)).toBe(
      'table.sources.tooltips.appConfig',
    );
    expect(getRoleSourceTooltip('csv-file', t)).toBe(
      'table.sources.tooltips.csv',
    );
    expect(getRoleSourceTooltip('rest', t)).toBe('table.sources.tooltips.form');
    expect(getRoleSourceTooltip('legacy', t)).toBe(
      'table.sources.tooltips.legacy',
    );
    expect(getRoleSourceTooltip(undefined, t)).toBe(
      'table.sources.tooltips.legacy',
    );
    expect(getRoleSourceTooltip('custom', t)).toBe(
      'table.sources.tooltips.generic',
    );
  });

  it('returns action tooltips only for immutable sources', () => {
    expect(getRoleSourceActionTooltip('configuration', t)).toBe(
      'table.sources.actionTooltips.appConfig',
    );
    expect(getRoleSourceActionTooltip('csv-file', t)).toBe(
      'table.sources.actionTooltips.csv',
    );
    expect(getRoleSourceActionTooltip('legacy', t)).toBe(
      'table.sources.actionTooltips.legacy',
    );
    expect(getRoleSourceActionTooltip('rest', t)).toBeUndefined();
    expect(getRoleSourceActionTooltip('custom', t)).toBe(
      'table.sources.actionTooltips.generic',
    );
  });
});
