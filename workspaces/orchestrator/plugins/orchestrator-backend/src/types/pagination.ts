import { Request } from 'express-serve-static-core';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
} from '../service/constants';

export interface Pagination {
  offset?: number;
  limit?: number;
  order?: string;
  sortField?: string;
}

export function buildPagination(req: Request): Pagination {
  return {
    offset: isNaN(req.query.page as any)
      ? DEFAULT_PAGE_NUMBER
      : Number(req.query.page),
    limit: isNaN(req.query.pageSize as any)
      ? DEFAULT_PAGE_SIZE
      : Number(req.query.pageSize),
    sortField: req.query.orderBy
      ? String(req.query.orderBy)
      : DEFAULT_SORT_FIELD,
    order: req.query.orderDirection
      ? String(req.query.orderDirection)
      : DEFAULT_SORT_ORDER,
  };
}
