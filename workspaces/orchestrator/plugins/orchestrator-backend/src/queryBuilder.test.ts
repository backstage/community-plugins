import { buildGraphQlQuery } from './helpers/queryBuilder';
import { Pagination } from './types/pagination';

describe('GraphQL query builder', () => {
  it('should return properly formatted graphQL query when where clause and pagination are present', () => {
    const expectedQuery: string =
      '{ProcessInstances (where: {processId: {isNull: false}}, orderBy: {lastUpdate: DESC}, pagination: {limit: 5 , offset: 2})  {id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';
    const pagination: Pagination = {
      offset: 2,
      limit: 5,
      order: 'DESC',
      sortField: 'lastUpdate',
    };
    expect(
      buildGraphQlQuery({
        type: 'ProcessInstances',
        queryBody:
          'id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}',
        whereClause: 'processId: {isNull: false}',
        pagination,
      }),
    ).toEqual(expectedQuery);
  });

  it('should return properly formatted graphQL query when where clause is present', () => {
    const expectedQuery: string =
      '{ProcessInstances (where: {processId: {isNull: false}})  {id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';
    expect(
      buildGraphQlQuery({
        type: 'ProcessInstances',
        queryBody:
          'id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}',
        whereClause: 'processId: {isNull: false}',
      }),
    ).toEqual(expectedQuery);
  });

  it('should return properly formatted graphQL query when where clause is NOT present', () => {
    const expectedQuery: string =
      '{ProcessInstances {id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';
    expect(
      buildGraphQlQuery({
        type: 'ProcessInstances',
        queryBody:
          'id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}',
      }),
    ).toEqual(expectedQuery);
  });
});
