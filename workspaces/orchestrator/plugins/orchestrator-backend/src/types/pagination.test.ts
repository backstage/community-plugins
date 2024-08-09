import { buildPagination } from './pagination';

describe('buildPagination()', () => {
  it('should build the correct pagination obj when no query parameters are passed', () => {
    const mockRequest: any = {
      body: {},
    };
    expect(buildPagination(mockRequest)).toEqual({});
  });
  it('should build the correct pagination obj when partial query parameters are passed', () => {
    const mockRequest: any = {
      body: {
        paginationInfo: {
          orderBy: 'lastUpdated',
        },
      },
    };
    expect(buildPagination(mockRequest)).toEqual({
      limit: undefined,
      offset: undefined,
      order: undefined,
      sortField: 'lastUpdated',
    });
  });
  it('should build the correct pagination obj when all query parameters are passed', () => {
    const mockRequest: any = {
      body: {
        paginationInfo: {
          offset: 1,
          pageSize: 50,
          orderBy: 'lastUpdated',
          orderDirection: 'DESC',
        },
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
      body: {
        paginationInfo: {
          offset: 'abc',
          pageSize: 'cde',
        },
      },
    };
    expect(buildPagination(mockRequest)).toEqual({
      limit: undefined,
      offset: undefined,
      order: undefined,
      sortField: undefined,
    });
  });
});
