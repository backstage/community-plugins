import { PingIdentityClient } from './client';
import { readPingIdentity } from './read';

jest.mock('./client');

const mockConfig = {
  id: 'default',
  apiPath: 'apiPath',
  authPath: 'authPath',
  envId: 'envId',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  schedule: {
    frequency: {
      minutes: 30,
    },
    initialDelay: undefined,
    scope: undefined,
    timeout: {
      minutes: 3,
    },
  },
};
const mockClient = new PingIdentityClient(mockConfig) as jest.Mocked<PingIdentityClient>;

describe('PingIdentity readPingIdentity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.getConfig.mockReturnValue(mockConfig);
  });

  it('should return users and groups', async () => {
    mockClient.getGroups.mockResolvedValue([
      { id: 'group1', name: 'Group One', description: 'Description of group one' },
    ]);
    mockClient.getUsers.mockResolvedValue([
      { id: 'user1', username: 'user1', email: 'user1@example.com', name: { given: 'User', family: 'One' } },
      { id: 'user2', username: 'user2', email: 'user2@example.com', name: { given: 'User', family: 'Two' } },
    ]);

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(1);
    expect(result.users).toHaveLength(2);
    expect(result.groups[0].metadata.name).toBe('Group One');
    expect(result.users[0].metadata.name).toBe('user1');
    expect(result.users[1].metadata.name).toBe('user2');
  });

  it('should handle empty users and groups', async () => {
    mockClient.getGroups.mockResolvedValue([]);
    mockClient.getUsers.mockResolvedValue([]);

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(0);
    expect(result.users).toHaveLength(0);
  });

  it('should handle users with group memberships', async () => {
    mockClient.getGroups.mockResolvedValue([
      { id: 'group1', name: 'Group One', description: 'Description of group one' },
    ]);
    mockClient.getUsers.mockResolvedValue([
      { id: 'user1', username: 'user1', email: 'user1@example.com', name: { given: 'User', family: 'One' } },
    ]);
    mockClient.getUsersInGroup.mockResolvedValue(['user1']);
    mockClient.getParentGroup.mockResolvedValue(undefined);

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].spec.memberOf).toHaveLength(1);
    expect(result.users[0].spec.memberOf).toStrictEqual(['Group One']);
  });

  it('should handle nested groups', async () => {
    mockClient.getGroups.mockResolvedValue([
      { id: 'group1', name: 'Group One', description: 'Description of group one' },
      { id: 'group2', name: 'Group Two', description: 'Description of group two', parentGroup: 'group1' },
    ]);
    mockClient.getUsers.mockResolvedValue([]);
    mockClient.getUsersInGroup.mockResolvedValue([]);
    mockClient.getParentGroup.mockImplementation(async (groupId) => {
      if (groupId === 'group2') return 'group1';
      return undefined;
    });

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(2);
    const groupTwo = result.groups.find(g => g.metadata.name === 'Group Two');

    expect(groupTwo?.spec.parent).toBe('group1');
  });

  it('should handle errors in fetching users or groups', async () => {
    mockClient.getGroups.mockRejectedValue(new Error('Failed to fetch groups'));
    mockClient.getUsers.mockRejectedValue(new Error('Failed to fetch users'));

    await expect(readPingIdentity(mockClient)).rejects.toThrow('Failed to fetch groups');
  });
});
