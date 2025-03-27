/*
 * Copyright 2025 The Backstage Authors
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

import type { AuditorServiceCreateEventOptions } from '@backstage/backend-plugin-api';

import { mockAuditorService, createEventMock } from './mock-utils';
import { type JsonObject } from '@backstage/types';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { EvaluationEvents } from '../src/auditor/auditor';

export function expectAuditorLog(
  events: {
    event: AuditorServiceCreateEventOptions;
    success?: { meta?: JsonObject };
    fail?: { meta?: JsonObject; error: Error };
  }[],
) {
  const auditEvents = mockAuditorService.createEvent.mock.calls;
  const succeededEvents = createEventMock.success.mock.calls;
  const failedEvents = createEventMock.fail.mock.calls;

  expect(auditEvents.length).toBe(events.length);
  for (let i = 0; i < events.length; i++) {
    const expectedEvent = { ...events[i].event, severityLevel: 'medium' };
    expect(auditEvents[i][0]).toEqual(expectedEvent); // verifies also eventId
    if (events[i].success) {
      expect(succeededEvents[i][0]).toEqual(events[i].success);
    }
    if (events[i].fail) {
      expect(failedEvents[i][0]).toEqual(events[i].fail);
    }
  }
}

export function expectAuditorLogForPermission(
  user: string | undefined,
  permissionName: string,
  resourceType: string | undefined,
  action: string,
  result: AuthorizeResult,
) {
  const expectedUser = user ?? 'user without entity';
  const meta = {
    action,
    permissionName,
    resourceType,
    userEntityRef: expectedUser,
  };
  expectAuditorLog([
    {
      event: { eventId: EvaluationEvents.PERMISSION_EVALUATION, meta },
      success: {
        meta: { result },
      },
    },
  ]);
}

export function clearAuditorMock() {
  mockAuditorService.createEvent.mockClear();
  createEventMock.fail.mockClear();
  createEventMock.success.mockClear();
}
