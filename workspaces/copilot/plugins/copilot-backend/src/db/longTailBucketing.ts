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

export type CostCenterBreakdownKind =
  | 'feature'
  | 'ide'
  | 'language-feature'
  | 'model-feature'
  | 'language-model'
  | 'customization';

type LongTailRow = {
  day: string;
};

type LongTailRule = {
  dimensions: readonly string[];
  groupBy?: readonly string[];
  scoreColumns: readonly string[];
  additiveColumns: readonly string[];
};

const activityColumns = [
  'code_generation_activity_count',
  'code_acceptance_activity_count',
] as const;

const lineCountColumns = [
  'loc_added_sum',
  'loc_deleted_sum',
  'loc_suggested_to_add_sum',
  'loc_suggested_to_delete_sum',
] as const;

const userInitiatedColumns = ['user_initiated_interaction_count'] as const;

export const COST_CENTER_BREAKDOWN_LIMIT = 10;

const COST_CENTER_LONG_TAIL_RULES: Record<
  CostCenterBreakdownKind,
  LongTailRule
> = {
  feature: {
    dimensions: ['feature'],
    scoreColumns: [...activityColumns, ...userInitiatedColumns],
    additiveColumns: [
      ...activityColumns,
      ...lineCountColumns,
      ...userInitiatedColumns,
    ],
  },
  ide: {
    dimensions: ['ide'],
    scoreColumns: [...activityColumns, ...userInitiatedColumns],
    additiveColumns: [
      ...activityColumns,
      ...lineCountColumns,
      ...userInitiatedColumns,
    ],
  },
  'language-feature': {
    dimensions: ['language', 'feature'],
    scoreColumns: activityColumns,
    additiveColumns: [...activityColumns, ...lineCountColumns],
  },
  'model-feature': {
    dimensions: ['model_id', 'feature'],
    scoreColumns: [...activityColumns, ...userInitiatedColumns],
    additiveColumns: [
      ...activityColumns,
      ...lineCountColumns,
      ...userInitiatedColumns,
    ],
  },
  'language-model': {
    dimensions: ['language', 'model_id'],
    scoreColumns: activityColumns,
    additiveColumns: ['request_count', ...activityColumns, ...lineCountColumns],
  },
  customization: {
    dimensions: ['item_name'],
    groupBy: ['category'],
    scoreColumns: ['interaction_count'],
    additiveColumns: ['interaction_count'],
  },
};

function getRowValue(row: LongTailRow, column: string): unknown {
  return (row as Record<string, unknown>)[column];
}

function getBreakdownName(row: LongTailRow, dimensions: readonly string[]) {
  return dimensions
    .map(column => String(getRowValue(row, column) ?? ''))
    .join('\u0000');
}

function compareNames(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function isOthersRow(row: LongTailRow, dimensions: readonly string[]): boolean {
  return dimensions.every(
    column => String(getRowValue(row, column) ?? '').toLowerCase() === 'others',
  );
}

function getScore(row: LongTailRow, columns: readonly string[]): number {
  return columns.reduce((total, column) => {
    const value = Number(getRowValue(row, column) ?? 0);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

function combineOthersRows<T extends LongTailRow>(
  rows: T[],
  rule: LongTailRule,
): T {
  const others: Record<string, unknown> = { ...rows[0] };
  delete others.id;

  for (const dimension of rule.dimensions) {
    others[dimension] = 'others';
  }

  for (const column of rule.additiveColumns) {
    const values = rows.map(row => getRowValue(row, column));
    if (values.some(value => typeof value === 'number')) {
      others[column] = values.reduce<number>(
        (total, value) =>
          total +
          (typeof value === 'number' && Number.isFinite(value) ? value : 0),
        0,
      );
    }
  }

  return others as T;
}

export function bucketCostCenterBreakdown<T extends LongTailRow>(
  rows: T[],
  kind: CostCenterBreakdownKind,
): T[] {
  if (rows.length === 0) {
    return rows;
  }

  const rule = COST_CENTER_LONG_TAIL_RULES[kind];
  const rowsByDayAndGroup = new Map<string, T[]>();
  for (const row of rows) {
    const groupKey = JSON.stringify([
      row.day,
      ...(rule.groupBy ?? []).map(column =>
        String(getRowValue(row, column) ?? ''),
      ),
    ]);
    const dayRows = rowsByDayAndGroup.get(groupKey) ?? [];
    dayRows.push(row);
    rowsByDayAndGroup.set(groupKey, dayRows);
  }

  const result: T[] = [];
  for (const dayRows of rowsByDayAndGroup.values()) {
    const namedRows = dayRows.filter(row => !isOthersRow(row, rule.dimensions));
    const existingOthers = dayRows.filter(row =>
      isOthersRow(row, rule.dimensions),
    );

    if (
      namedRows.length <= COST_CENTER_BREAKDOWN_LIMIT &&
      existingOthers.length === 0
    ) {
      result.push(...dayRows);
      continue;
    }

    const rankedRows = [...namedRows].sort((left, right) => {
      const scoreDifference =
        getScore(right, rule.scoreColumns) - getScore(left, rule.scoreColumns);
      return (
        scoreDifference ||
        compareNames(
          getBreakdownName(left, rule.dimensions),
          getBreakdownName(right, rule.dimensions),
        )
      );
    });
    const keptRows = rankedRows.slice(0, COST_CENTER_BREAKDOWN_LIMIT);
    const foldedRows = [
      ...existingOthers,
      ...rankedRows.slice(COST_CENTER_BREAKDOWN_LIMIT),
    ];

    result.push(...keptRows);
    if (foldedRows.length > 0) {
      result.push(combineOthersRows(foldedRows, rule));
    }
  }

  return result;
}
