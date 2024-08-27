import { GroupEntity, UserEntity } from '@backstage/catalog-model';

/**
 * Customize the ingested User entity
 *
 * @public
 *
 * @param {UserEntity} entity The output of the backstage default parser
 * @param {PingIdentityUser} pingIdentityUser The ping identity user representation
 * @param {GroupRepresentationWithParentAndEntity[]} groups Data about available groups (can be used to create additional relationships)
 *
 * @returns {Promise<UserEntity | undefined>} Resolve to a modified `UserEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type UserTransformer = (
  entity: UserEntity,
  pingIdentityUser: PingIdentityUser,
  envId: string,
  groups: GroupEntity[],
) => Promise<UserEntity | undefined>;

/**
 * Customize the ingested Group entity
 *
 * @public
 *
 * @param {GroupEntity} entity The output of the backstage default parser
 * @param {PingIdentityGroup} pingIdentityGroup The ping identity group representation
 * @param {string} realm Realm name
 *
 * @returns {Promise<GroupEntity | undefined>} Resolve to a modified `GroupEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type GroupTransformer = (
  entity: GroupEntity,
  pingIdentityGroup: PingIdentityGroup,
  envId: string,
) => Promise<GroupEntity | undefined>;

/**
 * Ping Identity API response type
 *
 * @public
 */
export interface PingIdentityResponse {
  _links: {
    self: {
      href: string;
    };
    prev?: {
      href: string;
    };
    next?: {
      href: string;
    };
  };
  _embedded: {
    users?: PingIdentityUser [];
    groups?: PingIdentityGroup[];
  };
  count?: number; // total count of items in the collection
  size?: number; // count of the current page of results
}

/**
 * Ping Identity user type
 *
 * @public
 */
export interface PingIdentityUser {
  _links: {
    self: {
      href: string;
    };
    password: {
      href: string;
    };
    'password.set': {
      href: string;
    };
    'password.reset': {
      href: string;
    };
    'password.check': {
      href: string;
    };
    'password.recover': {
      href: string;
    };
    account: {
      sendVerificationCode: {
        href: string;
      };
    };
    linkedAccounts: {
      href: string;
    };
  };
  _embedded?: {
    password?: {
      environment: {
        id: string;
      };
      user: {
        id: string;
      };
      passwordPolicy: {
        id: string;
      };
      status: string;
      lastChangedAt?: string;
    };
  };
  id: string;
  environment: {
    id: string;
  };
  account: {
    canAuthenticate: boolean;
    status: string;
  };
  createdAt: string;
  email: string;
  enabled: boolean;
  identityProvider: {
    type: string;
  };
  lifecycle: {
    status: string;
  };
  mfaEnabled: boolean;
  name: {
    given: string;
    family: string;
  };
  population: {
    id: string;
  };
  updatedAt: string;
  username: string;
  verifyStatus: string;
}

/**
 * Ping Identity group type
 *
 * @public
 */
export interface PingIdentityGroup {
  _links: {
    self: {
      href: string;
    };
  };
  id: string;
  environment: {
    id: string;
  };
  name: string;
  description: string;
  externalId?: string;
  customData?: {
    groupOwner: string;
    securityGroup: boolean;
  };
  directMemberCounts: {
    users: number;
  };
  createdAt: string;
  updatedAt: string;
  userFilter?: string;
}