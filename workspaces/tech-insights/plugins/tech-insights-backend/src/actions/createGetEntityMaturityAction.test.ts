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

import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createGetEntityMaturityAction } from './createGetEntityMaturityAction';

describe('createGetEntityMaturityAction', () => {
  it('ignores unranked checks when calculating maturity', async () => {
    const register = jest.fn();
    createGetEntityMaturityAction({
      actionsRegistry: { register } as any,
      catalog: {
        getEntityByRef: jest.fn().mockResolvedValue({
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: { name: 'service' },
        }),
      } as any,
      factChecker: {
        getChecks: jest.fn().mockResolvedValue([
          {
            id: 'bronze-check',
            type: 'json-rules-engine',
            name: 'Bronze check',
            description: 'A ranked check',
            factIds: [],
            metadata: { rank: 1 },
          },
          {
            id: 'ordinary-check',
            type: 'json-rules-engine',
            name: 'Ordinary check',
            description: 'An unranked check',
            factIds: [],
          },
        ]),
        runChecks: jest.fn().mockResolvedValue([
          { check: { id: 'bronze-check' }, facts: {}, result: true },
          { check: { id: 'ordinary-check' }, facts: {}, result: false },
        ]),
      } as any,
      permissions: {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
      } as any,
    });

    const action = register.mock.calls[0][0];
    await expect(
      action.action({
        input: { kind: 'Component', namespace: 'default', name: 'service' },
        credentials: {},
      }),
    ).resolves.toEqual({
      output: {
        entity: 'component:default/service',
        rank: 'Bronze',
        maxRank: 'Bronze',
      },
    });
  });
});
