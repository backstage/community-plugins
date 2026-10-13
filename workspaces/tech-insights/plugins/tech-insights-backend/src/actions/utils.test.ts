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
import { InputError, NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { authorize, toEntityRef } from './utils';

describe('authorize', () => {
  const permission = {
    type: 'basic',
    name: 'test.permission',
    attributes: {},
  } as const;

  it('resolves without throwing when the decision is ALLOW', async () => {
    const permissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
    };

    await expect(
      authorize(permissions as any, {} as any, permission),
    ).resolves.toBeUndefined();
  });

  it('throws NotAllowedError when the decision is DENY', async () => {
    const permissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
    };

    await expect(
      authorize(permissions as any, {} as any, permission),
    ).rejects.toThrow(NotAllowedError);
  });

  it('throws NotAllowedError when the decision is CONDITIONAL', async () => {
    const permissions = {
      authorize: jest.fn().mockResolvedValue([
        {
          result: AuthorizeResult.CONDITIONAL,
          conditions: {},
        },
      ]),
    };

    await expect(
      authorize(permissions as any, {} as any, permission),
    ).rejects.toThrow(NotAllowedError);
  });
});

describe('toEntityRef', () => {
  it('normalizes a valid entity ref string', () => {
    expect(toEntityRef('Component:default/service')).toBe(
      'component:default/service',
    );
  });

  it('throws an InputError with a stable message when the ref cannot be parsed', () => {
    expect(() => toEntityRef(':::')).toThrow(InputError);
    expect(() => toEntityRef(':::')).toThrow(/Invalid entity ref ':::':/);
  });
});
