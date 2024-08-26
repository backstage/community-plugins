import { UserEntity } from '@backstage/catalog-model';

export const mockUser: UserEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: {
    namespace: 'default',
    name: 'John Doe',
  },
  relations: [],
  spec: {
    memberOf: ['guests'],
    profile: {
      displayName: 'John Doe',
      email: 'john.doe@example.com',
    },
  },
};
