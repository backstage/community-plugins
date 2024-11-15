/*
 * Copyright 2022 The Backstage Authors
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
import { ConfigReader } from '@backstage/config';
import { IdentityApi } from '@backstage/core-plugin-api';
import { SegmentAnalytics } from './Segment';

const mockIdentify = jest.fn();
const mockPage = jest.fn();
const mockTrack = jest.fn();
const mockLoad = jest.fn();
jest.mock('@segment/analytics-next', () => {
  return {
    AnalyticsBrowser: function constructor() {
      return {
        identify: mockIdentify,
        page: mockPage,
        track: mockTrack,
        load: mockLoad,
      };
    },
  };
});

describe('SegmentAnalytics', () => {
  const context = {
    extension: 'App',
    pluginId: 'some-plugin',
    routeRef: 'unknown',
    releaseNum: 1337,
  };
  const writeKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const basicValidConfig = new ConfigReader({
    app: {
      analytics: { segment: { writeKey, testMode: false, maskIP: false } },
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fromConfig', () => {
    it('throws when missing writeKey', () => {
      const config = new ConfigReader({ app: { analytics: { segment: {} } } });
      expect(() => SegmentAnalytics.fromConfig(config)).toThrow(
        /Missing required config value/,
      );
    });

    it('returns implementation', () => {
      const api = SegmentAnalytics.fromConfig(basicValidConfig);
      expect(api.captureEvent).toBeDefined();
    });
  });

  describe('integration', () => {
    const maskedIPConfig = new ConfigReader({
      app: {
        analytics: { segment: { writeKey, testMode: false, maskIP: true } },
      },
    });

    it('track identify calls', async () => {
      const api = SegmentAnalytics.fromConfig(basicValidConfig);
      await api.captureEvent({
        action: 'identify',
        subject: 'jdoe',
        context,
      });

      expect(mockIdentify).toHaveBeenCalledTimes(1);
      expect(mockIdentify).toHaveBeenCalledWith(
        /* hashed id */ '6a646f65',
        {},
        {},
      );
    });

    it('track identify with maskedIP', async () => {
      const api = SegmentAnalytics.fromConfig(maskedIPConfig);
      await api.captureEvent({
        action: 'identify',
        subject: 'jdoe',
        context,
      });

      expect(mockIdentify).toHaveBeenCalledTimes(1);
      expect(mockIdentify).toHaveBeenCalledWith(
        /* hashed id */ '6a646f65',
        {},
        { ip: '0.0.0.0' },
      );
    });

    it('tracks basic pageview', async () => {
      const api = SegmentAnalytics.fromConfig(basicValidConfig);
      await api.captureEvent({
        action: 'navigate',
        subject: '/',
        context,
      });

      expect(mockPage).toHaveBeenCalledTimes(1);
      expect(mockPage).toHaveBeenCalledWith(context.pluginId, '/', context, {});
    });

    it('tracks pageview with maskedIP', async () => {
      const api = SegmentAnalytics.fromConfig(maskedIPConfig);
      await api.captureEvent({
        action: 'navigate',
        subject: '/',
        context,
      });
      expect(mockPage).toHaveBeenCalledTimes(1);
      expect(mockPage).toHaveBeenCalledWith(context.pluginId, '/', context, {
        ip: '0.0.0.0',
      });
    });

    it('tracks basic event', async () => {
      const api = SegmentAnalytics.fromConfig(basicValidConfig);

      const expectedAction = 'click';
      const expectedLabel = 'on something';
      const expectedValue = 42;
      await api.captureEvent({
        action: expectedAction,
        subject: expectedLabel,
        value: expectedValue,
        context,
      });

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        expectedAction,
        {
          subject: expectedLabel,
          context: context,
          attributes: undefined,
        },
        {},
      );
    });

    it('tracks event with MaskedIP', async () => {
      const api = SegmentAnalytics.fromConfig(maskedIPConfig);

      const expectedAction = 'click';
      const expectedLabel = 'on something';
      const expectedValue = 42;
      await api.captureEvent({
        action: expectedAction,
        subject: expectedLabel,
        value: expectedValue,
        context,
      });

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        expectedAction,
        {
          subject: expectedLabel,
          context: context,
          attributes: undefined,
        },
        { ip: '0.0.0.0' },
      );
    });
  });

  describe('identityApi', () => {
    const identityApi = {
      getBackstageIdentity: jest.fn().mockResolvedValue({
        userEntityRef: 'User:default/someone',
      }),
    } as unknown as IdentityApi;
    it('track identify calls', async () => {
      const api = SegmentAnalytics.fromConfig(basicValidConfig, identityApi);
      await api.captureEvent({
        action: 'identify',
        subject: 'jdoe',
        context,
      });

      expect(mockIdentify).toHaveBeenCalledTimes(1);
      expect(mockIdentify).toHaveBeenCalledWith(
        /* hashed id */ '557365723a64656661756c742f736f6d656f6e65',
        {},
        {},
      );
    });
  });
});
