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

import { bucketCostCenterBreakdown } from './longTailBucketing';

type FeatureRow = {
  day: string;
  feature: string;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
};

function featureRow(feature: string, count: number, day = '2026-05-01') {
  return {
    day,
    feature,
    code_generation_activity_count: count,
    code_acceptance_activity_count: count,
    loc_added_sum: count * 2,
    loc_deleted_sum: count * 3,
    loc_suggested_to_add_sum: count * 4,
    loc_suggested_to_delete_sum: count * 5,
    user_initiated_interaction_count: count,
  } satisfies FeatureRow;
}

describe('bucketCostCenterBreakdown', () => {
  it('keeps ten or fewer named values untouched and buckets each day independently', () => {
    const firstDay = Array.from({ length: 10 }, (_, index) =>
      featureRow(`feature-${index}`, index),
    );
    const secondDay = Array.from({ length: 11 }, (_, index) =>
      featureRow(`feature-${index}`, index, '2026-05-02'),
    );

    const result = bucketCostCenterBreakdown(
      [...firstDay, ...secondDay],
      'feature',
    );

    expect(result.slice(0, firstDay.length)).toEqual(firstDay);
    expect(result.slice(0, firstDay.length)).toEqual(
      expect.arrayContaining(firstDay),
    );
    expect(result.slice(firstDay.length)).toHaveLength(11);
    expect(result.slice(firstDay.length).at(-1)).toEqual(
      expect.objectContaining({ feature: 'others' }),
    );
    expect(
      result
        .slice(firstDay.length)
        .filter(row => row.feature !== 'others')
        .map(row => row.feature),
    ).toEqual([
      'feature-10',
      'feature-9',
      'feature-8',
      'feature-7',
      'feature-6',
      'feature-5',
      'feature-4',
      'feature-3',
      'feature-2',
      'feature-1',
    ]);
  });

  it('folds tail and existing others rows while preserving additive totals', () => {
    const rows = [
      ...Array.from({ length: 12 }, (_, index) =>
        featureRow(`feature-${index}`, index + 1),
      ),
      featureRow('others', 20),
      featureRow('OTHERS', 30),
    ];

    const result = bucketCostCenterBreakdown(rows, 'feature');
    const others = result.at(-1)!;

    expect(result).toHaveLength(11);
    expect(others.feature).toBe('others');
    expect(others.code_generation_activity_count).toBe(
      rows.reduce(
        (total, row) => total + row.code_generation_activity_count,
        0,
      ) -
        result
          .slice(0, -1)
          .reduce(
            (total, row) => total + row.code_generation_activity_count,
            0,
          ),
    );
    for (const column of [
      'code_acceptance_activity_count',
      'loc_added_sum',
      'loc_deleted_sum',
      'loc_suggested_to_add_sum',
      'loc_suggested_to_delete_sum',
      'user_initiated_interaction_count',
    ] as const) {
      expect(others[column]).toBe(
        rows.reduce((total, row) => total + row[column], 0) -
          result.slice(0, -1).reduce((total, row) => total + row[column], 0),
      );
    }
    expect(others.user_initiated_interaction_count).toBe(
      rows.reduce(
        (total, row) => total + row.user_initiated_interaction_count,
        0,
      ) -
        result
          .slice(0, -1)
          .reduce(
            (total, row) => total + row.user_initiated_interaction_count,
            0,
          ),
    );
    expect(others).not.toHaveProperty('id');
  });

  it('ranks pair combinations and emits a shared others/others row', () => {
    const rows = [
      ...Array.from({ length: 20 }, (_, index) => ({
        day: '2026-05-01',
        language: index === 10 ? 'top-language' : `language-${index}`,
        feature: index === 10 ? 'tail-feature' : `feature-${index}`,
        code_generation_activity_count: index === 10 ? 100 : index,
        code_acceptance_activity_count: 0,
        loc_added_sum: index,
        loc_deleted_sum: 0,
        loc_suggested_to_add_sum: 0,
        loc_suggested_to_delete_sum: 0,
      })),
      {
        day: '2026-05-01',
        language: 'OTHERS',
        feature: 'others',
        code_generation_activity_count: 20,
        code_acceptance_activity_count: 0,
        loc_added_sum: 10,
        loc_deleted_sum: 0,
        loc_suggested_to_add_sum: 0,
        loc_suggested_to_delete_sum: 0,
      },
      {
        day: '2026-05-01',
        language: 'others',
        feature: 'regular-feature',
        code_generation_activity_count: 200,
        code_acceptance_activity_count: 0,
        loc_added_sum: 20,
        loc_deleted_sum: 0,
        loc_suggested_to_add_sum: 0,
        loc_suggested_to_delete_sum: 0,
      },
    ];

    const result = bucketCostCenterBreakdown(rows, 'language-feature');

    expect(result).toHaveLength(11);
    expect(result[0]).toEqual(
      expect.objectContaining({
        language: 'others',
        feature: 'regular-feature',
        code_generation_activity_count: 200,
      }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        language: 'top-language',
        feature: 'tail-feature',
      }),
    );
    expect(result.at(-1)).toEqual(
      expect.objectContaining({
        language: 'others',
        feature: 'others',
        code_generation_activity_count: 76,
        loc_added_sum: 66,
      }),
    );
  });

  it('uses deterministic name ordering for tied scores', () => {
    const rows = [
      featureRow('zeta', 1),
      featureRow('alpha', 1),
      ...Array.from({ length: 9 }, (_, index) =>
        featureRow(`feature-${index}`, 1),
      ),
      featureRow('tail', 1),
    ];

    const result = bucketCostCenterBreakdown(rows, 'feature');

    expect(result.slice(0, 10).map(row => row.feature)).toEqual([
      'alpha',
      'feature-0',
      'feature-1',
      'feature-2',
      'feature-3',
      'feature-4',
      'feature-5',
      'feature-6',
      'feature-7',
      'feature-8',
    ]);
    expect(result.at(-1)?.feature).toBe('others');
  });

  it('buckets customization names independently by category and day', () => {
    const rows = [
      ...Array.from({ length: 12 }, (_, index) => ({
        day: '2026-05-01',
        category: 'skill',
        item_name: `skill-${index}`,
        interaction_count: index + 1,
      })),
      ...Array.from({ length: 12 }, (_, index) => ({
        day: '2026-05-01',
        category: 'model',
        item_name: `model-${index}`,
        interaction_count: index + 1,
      })),
    ];

    const result = bucketCostCenterBreakdown(rows, 'customization');
    const skillRows = result.filter(row => row.category === 'skill');
    const modelRows = result.filter(row => row.category === 'model');

    expect(skillRows).toHaveLength(11);
    expect(modelRows).toHaveLength(11);
    expect(skillRows.at(-1)).toEqual({
      day: '2026-05-01',
      category: 'skill',
      item_name: 'others',
      interaction_count: 3,
    });
    expect(modelRows.at(-1)).toEqual({
      day: '2026-05-01',
      category: 'model',
      item_name: 'others',
      interaction_count: 3,
    });
  });
});
