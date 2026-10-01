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

import { InputError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { DateTime } from 'luxon';
import { createGetFactsInRangeAction } from './createGetFactsInRangeAction';

describe('createGetFactsInRangeAction', () => {
  const register = jest.fn();
  const getFactsBetweenTimestampsByIds = jest.fn().mockResolvedValue({});
  const permissions = {
    authorize: jest.fn().mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    permissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
    createGetFactsInRangeAction({
      actionsRegistry: { register } as any,
      permissions: permissions as any,
      techInsightsStore: { getFactsBetweenTimestampsByIds } as any,
    });
  });

  const getAction = () => register.mock.calls[0][0].action;

  it('rejects invalid ISO date-times', async () => {
    await expect(
      getAction()({
        input: {
          entity: 'component:default/service',
          ids: ['firstId'],
          startDateTime: 'not-a-date',
          endDateTime: '2022-11-11T11:11:11',
        },
        credentials: {},
      }),
    ).rejects.toThrow(InputError);
    expect(getFactsBetweenTimestampsByIds).not.toHaveBeenCalled();
  });

  it('rejects a reversed date range', async () => {
    await expect(
      getAction()({
        input: {
          entity: 'component:default/service',
          ids: ['firstId'],
          startDateTime: '2022-11-11T11:11:11',
          endDateTime: '2021-12-12T12:12:12',
        },
        credentials: {},
      }),
    ).rejects.toThrow(InputError);
    expect(getFactsBetweenTimestampsByIds).not.toHaveBeenCalled();
  });

  it('passes normalized dates and entity ref to the store', async () => {
    await getAction()({
      input: {
        entity: 'component:default/service',
        ids: ['firstId', 'secondId'],
        startDateTime: '2021-12-12T12:12:12',
        endDateTime: '2022-11-11T11:11:11',
      },
      credentials: {},
    });

    expect(getFactsBetweenTimestampsByIds).toHaveBeenCalledWith(
      ['firstId', 'secondId'],
      'component:default/service',
      DateTime.fromISO('2021-12-12T12:12:12'),
      DateTime.fromISO('2022-11-11T11:11:11'),
    );
  });
});
