import { myUserTransformer } from './module';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

const MICROSOFT_GRAPH_USER_ID_ANNOTATION = 'graph.microsoft.com/user-id';

describe('myUserTransformer', () => {
  it('should transform userPrincipalName correctly', async () => {
    const user: MicrosoftGraph.User = {
      id: '123',
      displayName: 'Foo Bar',
      mail: 'Foo~Bar@example.com',
      userPrincipalName: 'Foo~Bar@example.com',
    };

    const transformedUser = await myUserTransformer(user);

    expect(transformedUser).toBeDefined();
    expect(transformedUser?.metadata.name).toBe('foo_bar_example.com');
    expect(transformedUser?.metadata.annotations).toEqual({
      [MICROSOFT_GRAPH_USER_ID_ANNOTATION]: '123',
    });
    expect(transformedUser?.spec.profile).toBeDefined();
    expect(transformedUser?.spec.profile?.displayName).toBeDefined();
    expect(transformedUser?.spec.profile?.displayName).toEqual('Foo Bar');
  });

  it('should return user without email', async () => {
    const userWithoutMail: MicrosoftGraph.User = {
      id: '123',
      displayName: 'Foo Bar',
      userPrincipalName: 'Foo~Bar@example.com',
    };

    const transformedUser = await myUserTransformer(userWithoutMail);

    expect(transformedUser).toBeDefined();
    expect(transformedUser?.metadata.name).toBe('foo_bar_example.com');
    expect(transformedUser?.metadata.annotations).toEqual({
      [MICROSOFT_GRAPH_USER_ID_ANNOTATION]: '123',
    });
    expect(transformedUser?.spec.profile).toBeDefined();
    expect(transformedUser?.spec.profile?.displayName).toBeDefined();
    expect(transformedUser?.spec.profile?.displayName).toEqual('Foo Bar');
  });

  it('should not return user without id', async () => {
    const userWithoutId: MicrosoftGraph.User = {
      displayName: 'Foo Bar',
      userPrincipalName: 'Foo~Bar@example.com',
    };

    const transformedUser = await myUserTransformer(userWithoutId);

    expect(transformedUser).toBeUndefined();
  });

  it('should not return user without display name', async () => {
    const userWithoutId: MicrosoftGraph.User = {
      id: '123',
      displayName: 'Foo Bar',
    };

    const transformedUser = await myUserTransformer(userWithoutId);

    expect(transformedUser).toBeUndefined();
  });

  it('should not return user without user principal name', async () => {
    const userWithoutId: MicrosoftGraph.User = {
      id: '123',
      displayName: 'Foo Bar',
    };

    const transformedUser = await myUserTransformer(userWithoutId);

    expect(transformedUser).toBeUndefined();
  });
});
