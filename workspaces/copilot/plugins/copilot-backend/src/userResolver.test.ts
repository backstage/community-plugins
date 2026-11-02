/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DefaultCopilotUserResolver } from './userResolver';

describe('DefaultCopilotUserResolver', () => {
  const credentials = {} as any;

  it('resolves the GitHub login from the catalog annotation', async () => {
    const catalog = {
      getEntityByRef: jest.fn().mockResolvedValue({
        metadata: {
          annotations: { 'github.com/user-login': 'octocat' },
        },
      }),
    };

    await expect(
      new DefaultCopilotUserResolver().resolveUserLogin({
        userEntityRef: 'user:employees/alice',
        credentials,
        services: { catalog: catalog as any },
      }),
    ).resolves.toBe('octocat');
    expect(catalog.getEntityByRef).toHaveBeenCalledWith(
      'user:employees/alice',
      { credentials },
    );
  });

  it('does not use the entity name when no GitHub login annotation exists', async () => {
    const catalog = {
      getEntityByRef: jest.fn().mockResolvedValue({ metadata: {} }),
    };

    await expect(
      new DefaultCopilotUserResolver().resolveUserLogin({
        userEntityRef: 'user:employees/alice',
        credentials,
        services: { catalog: catalog as any },
      }),
    ).resolves.toBeUndefined();
  });
});
