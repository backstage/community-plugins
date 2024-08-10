import { FilterInfo } from '@backstage-community/plugin-orchestrator-common';

import { Pagination } from '../types/pagination';

export function buildGraphQlQuery(args: {
  type: 'ProcessDefinitions' | 'ProcessInstances' | 'Jobs';
  queryBody: string;
  whereClause?: string;
  pagination?: Pagination;
}): string {
  let query = `{${args.type}`;

  const whereClause = buildWhereClause(args.whereClause);
  const paginationClause = buildPaginationClause(args.pagination);

  if (whereClause || paginationClause) {
    query += ' (';
    query += [whereClause, paginationClause].filter(Boolean).join(', ');
    query += ') ';
  }

  query += ` {${args.queryBody} } }`;

  return query.replace(/\s+/g, ' ').trim();
}

function buildWhereClause(whereClause?: string): string {
  return whereClause ? `where: {${whereClause}}` : '';
}

function buildPaginationClause(pagination?: Pagination): string {
  if (!pagination) return '';

  const parts = [];

  if (pagination.sortField !== undefined) {
    parts.push(
      `orderBy: {${pagination.sortField}: ${
        pagination.order !== undefined ? pagination.order?.toUpperCase() : 'ASC'
      }}`,
    );
  }

  const paginationParts = [];
  if (pagination.limit !== undefined) {
    paginationParts.push(`limit: ${pagination.limit}`);
  }
  if (pagination.offset !== undefined) {
    paginationParts.push(`offset: ${pagination.offset}`);
  }
  if (paginationParts.length) {
    parts.push(`pagination: {${paginationParts.join(', ')}}`);
  }

  return parts.join(', ');
}

export function buildFilterCondition(filter?: FilterInfo): string {
  return filter?.fieldName && filter?.operator && filter?.fieldValue
    ? `${filter?.fieldName}:{ ${filter?.operator}: ${filter?.fieldValue}}`
    : '';
}
