import { buildPagination } from './types/pagination';

describe('buildPagination()', () => {
  it('should build the correct pagination obj when no query parameters are passed', () => {
    const mockRequest: any = {
      query: {},
    };
    expect(buildPagination(mockRequest)).toEqual({
      limit: 10,
      offset: 0,
      order: 'ASC',
      sortField: undefined,
    });
  });
  it('should build the correct pagination obj when partial query parameters are passed', () => {
    const mockRequest: any = {
      query: {
        orderBy: 'lastUpdated',
      },
    };
    expect(buildPagination(mockRequest)).toEqual({
      limit: 10,
      offset: 0,
      order: 'ASC',
      sortField: 'lastUpdated',
    });
  });
  it('should build the correct pagination obj when all query parameters are passed', () => {
    const mockRequest: any = {
      query: {
        page: 1,
        pageSize: 50,
        orderBy: 'lastUpdated',
        orderDirection: 'DESC',
      },
    };
    expect(buildPagination(mockRequest)).toEqual({
      limit: 50,
      offset: 1,
      order: 'DESC',
      sortField: 'lastUpdated',
    });
  });
  it('should build the correct pagination obj when non numeric value passed to number fields', () => {
    const mockRequest: any = {
      query: {
        page: 'abc',
        pageSize: 'cde',
      },
    };
    expect(buildPagination(mockRequest)).toEqual({
      limit: 10,
      offset: 0,
      order: 'ASC',
      sortField: undefined,
    });
  });
});
