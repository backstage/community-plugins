import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import {
  defaultGroupTransformer,
  defaultUserTransformer,
} from './defaultTransformers';

describe('defaultTransformers', () => {
  it('tests defaultGroupTransformer', async () => {
    const group: GroupEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        annotations: { 'graph.microsoft.com/group-id': 'foo' },
        name: 'bar',
      },
      spec: {
        children: [],
        profile: { displayName: 'BAR' },
        type: 'team',
      },
    };
    const result = await defaultGroupTransformer(group, 'envId');
    // should not make any transformations
    expect(result).toEqual(group);
  });

  it('tests defaultUserTransformer', async () => {
    const user: UserEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        annotations: {
          'graph.microsoft.com/user-id': 'foo',
        },
        name: 'test~user@example.com',
      },
      spec: {
        memberOf: [],
        profile: {
          displayName: 'BAR'
        },
      },
    };
    const result = await defaultUserTransformer(user, 'envId', []);
    // should normalize illegal characters in metadata.annotations.name
    expect(result).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        annotations: {
          'graph.microsoft.com/user-id': 'foo',
        },
        name: 'test_user_example.com',
      },
      spec: {
        memberOf: [],
        profile: {
          displayName: 'BAR'
        },
      },
    });
  });
});