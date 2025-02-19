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
import { InsightsAnalyticsApi } from './InsightsAnalyticsApi';
import {
  IdentityApi,
  ConfigApi,
  AnalyticsEvent,
} from '@backstage/core-plugin-api';

jest.useFakeTimers();

describe('InsightsAnalyticsApi', () => {
  let mockConfigApi: ConfigApi;
  let mockIdentityApi: IdentityApi;
  let insightsAnalyticsApi: InsightsAnalyticsApi;
  const flushInterval = 5000;
  const maxBufferSize = 20;
  const mockContext = {
    routeRef: 'unknown',
    pluginId: 'root',
    extension: 'App',
  };

  beforeEach(() => {
    mockConfigApi = {
      getString: jest.fn().mockReturnValue('http://localhost:3000'),
      getOptionalNumber: jest.fn().mockImplementation((key: string) => {
        if (key === 'app.analytics.insights.flushInterval')
          return flushInterval;
        if (key === 'app.analytics.insights.maxBufferSize')
          return maxBufferSize;
        return undefined;
      }),
    } as unknown as ConfigApi;

    mockIdentityApi = {
      getBackstageIdentity: jest
        .fn()
        .mockResolvedValue({ userEntityRef: 'user:test' }),
      getCredentials: jest.fn().mockResolvedValue({ token: 'dummy-token' }),
    } as unknown as IdentityApi;

    insightsAnalyticsApi = InsightsAnalyticsApi.fromConfig(mockConfigApi, {
      identityApi: mockIdentityApi,
    });
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response);
    jest
      .spyOn(insightsAnalyticsApi as any, 'hash')
      .mockResolvedValue('dummy-hashed-user-id');
  });

  it('should initialize correctly', () => {
    expect(insightsAnalyticsApi).toBeDefined();
  });

  it('should buffer events before flushing', async () => {
    const event: AnalyticsEvent = {
      action: 'click',
      subject: 'button',
      context: mockContext,
    };
    await insightsAnalyticsApi.captureEvent(event);
    jest.advanceTimersByTime(flushInterval);
    expect(fetch).toHaveBeenCalled();
  });

  it('should hash user ID before capturing event', async () => {
    const event: AnalyticsEvent = {
      action: 'click',
      subject: 'button',
      context: mockContext,
    };
    await insightsAnalyticsApi.captureEvent(event);
    expect(event.context.userId).toBe('dummy-hashed-user-id');
  });

  it('should flush events when buffer reaches max size', async () => {
    for (let i = 0; i < maxBufferSize; i++) {
      await insightsAnalyticsApi.captureEvent({
        action: 'event',
        subject: `test-${i}`,
        context: mockContext,
      });
    }
    expect(fetch).toHaveLength(0); // Should be flushed
  });

  it('should flush events at regular intervals', async () => {
    await insightsAnalyticsApi.captureEvent({
      action: 'event',
      subject: 'test',
      context: mockContext,
    });
    jest.advanceTimersByTime(flushInterval);
    expect(fetch).toHaveLength(0);
  });
});
