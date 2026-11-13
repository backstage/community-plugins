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
import { Entity } from '@backstage/catalog-model';
import { NEWRELIC_GUID_ANNOTATION } from './constants';
import { getDashboardGuids, parseDashboardGuids } from './dashboardGuids';
import { isNewRelicDashboardAvailable } from './Router';

const entityWith = (annotations?: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'my-service', annotations },
});

describe('parseDashboardGuids', () => {
  it('returns a single GUID unchanged', () => {
    expect(parseDashboardGuids('MXxWSVp8REFTSEJPQVJEfDEyMzQ')).toEqual([
      'MXxWSVp8REFTSEJPQVJEfDEyMzQ',
    ]);
  });

  it('splits comma-separated GUIDs in order', () => {
    expect(parseDashboardGuids('guid-1,guid-2,guid-3')).toEqual([
      'guid-1',
      'guid-2',
      'guid-3',
    ]);
  });

  it('trims whitespace around each GUID', () => {
    expect(parseDashboardGuids('  guid-1 ,\tguid-2\n')).toEqual([
      'guid-1',
      'guid-2',
    ]);
  });

  it('ignores empty entries', () => {
    expect(parseDashboardGuids(',guid-1,, ,guid-2,')).toEqual([
      'guid-1',
      'guid-2',
    ]);
  });

  it('drops repeated GUIDs, keeping the first occurrence', () => {
    expect(parseDashboardGuids('guid-1, guid-2, guid-1')).toEqual([
      'guid-1',
      'guid-2',
    ]);
  });

  it.each([undefined, '', '   ', ' , ,'])(
    'returns no GUIDs for %p',
    annotation => {
      expect(parseDashboardGuids(annotation)).toEqual([]);
    },
  );
});

describe('getDashboardGuids', () => {
  it('reads the dashboard GUID annotation', () => {
    expect(
      getDashboardGuids(
        entityWith({ [NEWRELIC_GUID_ANNOTATION]: 'guid-1, guid-2' }),
      ),
    ).toEqual(['guid-1', 'guid-2']);
  });

  it('returns no GUIDs when the annotation is missing', () => {
    expect(getDashboardGuids(entityWith())).toEqual([]);
    expect(getDashboardGuids(entityWith({ other: 'value' }))).toEqual([]);
  });
});

describe('isNewRelicDashboardAvailable', () => {
  it('is true for one or more GUIDs', () => {
    expect(
      isNewRelicDashboardAvailable(
        entityWith({ [NEWRELIC_GUID_ANNOTATION]: 'guid-1' }),
      ),
    ).toBe(true);
    expect(
      isNewRelicDashboardAvailable(
        entityWith({ [NEWRELIC_GUID_ANNOTATION]: 'guid-1,guid-2' }),
      ),
    ).toBe(true);
  });

  it('is false when the annotation is missing or has no GUIDs', () => {
    expect(isNewRelicDashboardAvailable(entityWith())).toBe(false);
    expect(
      isNewRelicDashboardAvailable(
        entityWith({ [NEWRELIC_GUID_ANNOTATION]: ' , ' }),
      ),
    ).toBe(false);
  });
});
