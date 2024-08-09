import { Pagination } from '../types/pagination';
import { buildGraphQlQuery } from './queryBuilder';

describe('buildGraphQlQuery', () => {
  const queryBody = 'id status';
  const type = 'ProcessInstances';
  const offset = 0;
  const limit = 10;
  const order = 'asc';
  const sortField = 'name';
  const pagination: Pagination = {
    offset,
    limit,
    order,
    sortField,
  };

  const paginationString = `orderBy: {${sortField}: ${order.toUpperCase()}}, pagination: {limit: ${limit}, offset: ${offset}})`;
  const whereClause = 'version: "1.0"';

  it('should build a basic query without where clause and pagination', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
    });
    expect(result).toBe(`{${type} {${queryBody} } }`);
  });

  it('should build a query with a where clause', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
      whereClause,
    });
    expect(result).toBe(`{${type} (where: {${whereClause}}) {${queryBody} } }`);
  });

  it('should build a query with pagination', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
      pagination,
    });
    expect(result).toBe(`{${type} (${paginationString} {${queryBody} } }`);
  });

  it('should build a query with both where clause and pagination', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
      whereClause,
      pagination,
    });
    expect(result).toBe(
      `{${type} (where: {${whereClause}}, ${paginationString} {${queryBody} } }`,
    );
  });
});
