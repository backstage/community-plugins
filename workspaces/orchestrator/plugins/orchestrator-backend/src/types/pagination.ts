import { Request } from 'express-serve-static-core';

import { PaginationInfoDTO } from '@backstage-community/plugin-orchestrator-common';

export interface Pagination {
  offset?: number;
  limit?: number;
  order?: string;
  sortField?: string;
}

export function buildPagination(req: Request): Pagination {
  const pagination: Pagination = {
    limit: undefined,
    offset: undefined,
    order: undefined,
    sortField: undefined,
  };

  if (!req.body?.paginationInfo) {
    return pagination;
  }
  const { offset, pageSize, orderBy, orderDirection } = req.body
    .paginationInfo as PaginationInfoDTO;

  if (!isNaN(Number(offset))) {
    pagination.offset = Number(offset);
  }

  if (!isNaN(Number(pageSize))) {
    pagination.limit = Number(pageSize);
  }

  if (orderBy) {
    pagination.sortField = String(orderBy);
  }

  if (orderDirection) {
    pagination.order = String(orderDirection).toUpperCase();
  }
  return pagination;
}
