import { Pagination } from '../types/pagination';

export function buildGraphQlQuery(args: {
  type: 'ProcessDefinitions' | 'ProcessInstances' | 'Jobs';
  queryBody: string;
  whereClause?: string;
  pagination?: Pagination;
}): string {
  let query = `{${args.type}`;

  if (args.whereClause || args.pagination) {
    query += ` (`;

    if (args.whereClause) {
      query += `where: {${args.whereClause}}`;
      if (args.pagination) {
        query += `, `;
      }
    }
    if (args.pagination) {
      if (args.pagination.sortField) {
        query += `orderBy: {${
          args.pagination.sortField
        }: ${args.pagination.order?.toUpperCase()}}, `;
      }
      query += `pagination: {limit: ${args.pagination.limit} , offset: ${args.pagination.offset}}`;
    }

    query += `) `;
  }
  query += ` {${args.queryBody} } }`;

  return query;
}
