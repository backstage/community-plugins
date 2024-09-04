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
const mockClient = new PingIdentityClient(
  mockConfig,
) as jest.Mocked<PingIdentityClient>;

const exampleUser1 = {
  _links: {
    self: {
      href: 'https://api.pingone.com',
    },
    password: {
      href: 'https://api.pingone.com',
    },
    'password.set': {
      href: 'https://api.pingone.com',
    },
    'password.reset': {
      href: 'https://api.pingone.com',
    },
    'password.check': {
      href: 'https://api.pingone.com',
    },
    'password.recover': {
      href: 'https://api.pingone.com',
    },
    account: {
      sendVerificationCode: {
        href: 'https://api.pingone.com',
      },
    },
    linkedAccounts: {
      href: 'https://api.pingone.com',
    },
  },
  id: 'user1',
  environment: {
    id: 'example-env',
  },
  account: {
    canAuthenticate: true,
    status: '',
  },
  createdAt: '',
  email: 'user1@example.com',
  enabled: true,
  identityProvider: {
    type: '',
  },
  lifecycle: {
    status: '',
  },
  mfaEnabled: false,
  name: {
    given: 'User',
    family: 'One',
  },
  population: {
    id: '',
  },
  updatedAt: '',
  username: 'user1',
  verifyStatus: '',
};

const exampleUser2 = {
  _links: {
    self: {
      href: 'https://api.pingone.com',
    },
    password: {
      href: 'https://api.pingone.com',
    },
    'password.set': {
      href: 'https://api.pingone.com',
    },
    'password.reset': {
      href: 'https://api.pingone.com',
    },
    'password.check': {
      href: 'https://api.pingone.com',
    },
    'password.recover': {
      href: 'https://api.pingone.com',
    },
    account: {
      sendVerificationCode: {
        href: 'https://api.pingone.com',
      },
    },
    linkedAccounts: {
      href: 'https://api.pingone.com',
    },
  },
  id: 'user2',
  environment: {
    id: 'example-env',
  },
  account: {
    canAuthenticate: true,
    status: '',
  },
  createdAt: '',
  email: 'user2@example.com',
  enabled: true,
  identityProvider: {
    type: '',
  },
  lifecycle: {
    status: '',
  },
  mfaEnabled: false,
  name: {
    given: 'User',
    family: 'Two',
  },
  population: {
    id: '',
  },
  updatedAt: '',
  username: 'user2',
  verifyStatus: '',
};

describe('PingIdentity readPingIdentity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.getConfig.mockReturnValue(mockConfig);
  });

  it('should return users and groups', async () => {
    mockClient.getGroups.mockResolvedValue([
      {
        id: 'group1',
        name: 'Group One',
        description: 'Description of group one',
        _links: {
          self: {
            href: '',
          },
        },
        environment: {
          id: '',
        },
        directMemberCounts: {
          users: 0,
        },
        createdAt: '',
        updatedAt: '',
      },
    ]);
    mockClient.getUsers.mockResolvedValue([exampleUser1, exampleUser2]);

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(1);
    expect(result.users).toHaveLength(2);
    expect(result.groups[0].metadata.name).toBe('Group_One');
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
      {
        id: 'group1',
        name: 'Group One',
        description: 'Description of group one',
        _links: {
          self: {
            href: '',
          },
        },
        environment: {
          id: '',
        },
        directMemberCounts: {
          users: 0,
        },
        createdAt: '',
        updatedAt: '',
      },
    ]);
    mockClient.getUsers.mockResolvedValue([exampleUser1]);
    mockClient.getUsersInGroup.mockResolvedValue(['user1']);
    mockClient.getParentGroupId.mockResolvedValue(undefined);

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].spec.memberOf).toHaveLength(1);
    expect(result.users[0].spec.memberOf).toStrictEqual(['Group_One']);
  });

  it('should handle nested groups', async () => {
    mockClient.getGroups.mockResolvedValue([
      {
        id: 'group1',
        name: 'Group One',
        description: 'Description of group one',
        _links: {
          self: {
            href: '',
          },
        },
        environment: {
          id: '',
        },
        directMemberCounts: {
          users: 0,
        },
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'group2',
        name: 'Group Two',
        description: 'Description of group two',
        _links: {
          self: {
            href: '',
          },
        },
        environment: {
          id: '',
        },
        directMemberCounts: {
          users: 0,
        },
        createdAt: '',
        updatedAt: '',
      },
    ]);
    mockClient.getUsers.mockResolvedValue([]);
    mockClient.getUsersInGroup.mockResolvedValue([]);
    mockClient.getParentGroupId.mockImplementation(async groupId => {
      if (groupId === 'group2') return 'group1';
      return undefined;
    });

    const result = await readPingIdentity(mockClient);

    expect(result.groups).toHaveLength(2);
    const groupTwo = result.groups.find(g => g.metadata.name === 'Group_Two');

    expect(groupTwo?.spec.parent).toBe('Group_One');
  });

  it('should handle errors in fetching users or groups', async () => {
    mockClient.getGroups.mockRejectedValue(new Error('Failed to fetch groups'));
    mockClient.getUsers.mockRejectedValue(new Error('Failed to fetch users'));

    await expect(readPingIdentity(mockClient)).rejects.toThrow(
      'Failed to fetch groups',
    );
  });
});
