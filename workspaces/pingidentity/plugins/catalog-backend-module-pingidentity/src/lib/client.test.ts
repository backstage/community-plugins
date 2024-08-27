import { registerMswTestHooks } from '@backstage/backend-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { PingIdentityClient } from './client';
import { PingIdentityProviderConfig } from './config';

describe('PingIdentityClient', () => {
  const worker = setupServer();
  registerMswTestHooks(worker);

  const mockConfig: PingIdentityProviderConfig = {
    id: 'default',
    authPath: 'https://auth.example.com',
    apiPath: 'https://api.example.com',
    envId: 'envId',
    clientId: 'clientId',
    clientSecret: 'clientSecret',
  };

  let client: PingIdentityClient;

  beforeEach(() => {
    jest.resetAllMocks();
    client = new PingIdentityClient(mockConfig);
  });

  it('should fetch access token and make API request', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/query', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ result: 'success' }),
        );
      }),
    );

    const response = await client.requestApi('query');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: 'success' });
  });

  it('should refresh access token on 401 and retry request', async () => {
    let tokenFetchCount = 0;

    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        tokenFetchCount += 1;
        return res(
          ctx.status(200),
          ctx.json({ access_token: `ACCESS_TOKEN_${tokenFetchCount}` }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/query', (req, res, ctx) => {
        const token = req.headers.get('Authorization');
        if (token === 'Bearer ACCESS_TOKEN_1') {
          return res(ctx.status(401));
        }
        return res(
          ctx.status(200),
          ctx.json({ result: 'success' }),
        );
      }),
    );

    const response = await client.requestApi('query');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: 'success' });
    expect(tokenFetchCount).toBe(2); // First for initial attempt, second for retry
  });

  it('should throw an error if fetching the access token fails', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: 'invalid_client' }));
      }),
    );

    await expect(client.requestApi('query')).rejects.toThrow(
      'Error getting access token: Bad Request',
    );
  });

  it('should throw an error if API request fails', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/query', (_, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }));
      }),
    );

    await expect(client.requestApi('query')).rejects.toThrow(
      'Error fetching: Internal Server Error',
    );
  });

  it('should fetch users', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/users', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            _embedded: {
              users: [
                {
                  id: 'user1id',
                  username: 'user1',
                  name: {
                    given: "User",
                    family: "One"
                  },
                  email: "user1@example.com",
                },
                {
                  id: 'user2id',
                  username: 'user2',
                  name: {
                    given: "User",
                    family: "Two"
                  },
                  email: "user2@example.com",
                },
              ],
            },
          }),
        );
      }),
    );

    const users = await client.getUsers(10);

    expect(users).toEqual([
      {
        id: 'user1id',
        username: 'user1',
        name: {
          given: "User",
          family: "One"
        },
        email: "user1@example.com",
      },
      {
        id: 'user2id',
        username: 'user2',
        name: {
          given: "User",
          family: "Two"
        },
        email: "user2@example.com",
      },
    ]);
  });

  it('should fetch groups', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/groups', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            _embedded: {
              groups: [
                {
                  id: 'group1id',
                  description: 'description for group 1',
                  name: 'group1name'
                },
                {
                  id: 'group2id',
                  description: 'description for group 2',
                  name: 'group2name'
                },
              ],
            },
          }),
        );
      }),
    );

    const groups = await client.getGroups(10);

    expect(groups).toEqual([
      {
        id: 'group1id',
        description: 'description for group 1',
        name: 'group1name'
      },
      {
        id: 'group2id',
        description: 'description for group 2',
        name: 'group2name'
      },
    ]);
  });

  it('should fetch parent group', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/groups/group1/memberOfGroups', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            size: 1,
            _embedded: {
              groupMemberships: [
                { id: 'ParentGroup' },
              ],
            },
          }),
        );
      }),
    );

    const parentGroup = await client.getParentGroupId('group1');

    expect(parentGroup).toBe('ParentGroup');
  });

  it('should return undefined if no parent group exists', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/groups/group1/memberOfGroups', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            size: 0,
            _embedded: {
              groupMemberships: [],
            },
          }),
        );
      }),
    );

    const parentGroup = await client.getParentGroupId('group1');

    expect(parentGroup).toBeUndefined();
  });

  it('should fetch users in a group', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/users', (req, res, ctx) => {
        expect(req.url.searchParams.get('filter')).toBe('memberOfGroups[id eq "group1"]');
        return res(
          ctx.status(200),
          ctx.json({
            count: 2,
            _embedded: {
              users: [
                { id: 'user1' },
                { id: 'user2' },
              ],
            },
          }),
        );
      }),
    );

    const usersInGroup = await client.getUsersInGroup('group1');

    expect(usersInGroup).toEqual(['user1', 'user2']);
  });

  it('should return empty array if no users are in the group', async () => {
    worker.use(
      rest.post('https://auth.example.com/envId/as/token', (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ access_token: 'ACCESS_TOKEN' }),
        );
      }),
      rest.get('https://api.example.com/environments/envId/users', (req, res, ctx) => {
        expect(req.url.searchParams.get('filter')).toBe('memberOfGroups[id eq "group1"]');
        return res(
          ctx.status(200),
          ctx.json({
            count: 0,
            _embedded: {
              users: [],
            },
          }),
        );
      }),
    );

    const usersInGroup = await client.getUsersInGroup('group1');

    expect(usersInGroup).toEqual([]);
  });
});
