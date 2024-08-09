import { Request } from 'express-serve-static-core';

export const Operator = {
  Equal: 'equal',
  In: 'in',
} as const;

export type OperatorType = (typeof Operator)[keyof typeof Operator];

export interface FilterInfo {
  fieldName: string;
  operator: OperatorType;
  fieldValue: FilterValue;
}

export type FilterValue = boolean | number | string;

export function buildFilter(req: Request): FilterInfo | undefined {
  if (!req.body.filterInfo) {
    return undefined;
  }
  const { fieldName, operator, fieldValue } = req.body.filterInfo as FilterInfo;

  if (fieldName && operator && fieldValue) {
    return {
      fieldName,
      operator,
      fieldValue: parseFilterValue(fieldValue),
    };
  }

  return undefined;
}

function parseFilterValue(value: FilterValue): string | number | boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' && !isNaN(Number(value))) return Number(value);
  return value;
}
