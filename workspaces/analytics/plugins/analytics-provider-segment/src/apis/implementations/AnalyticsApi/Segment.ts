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
import { Config } from '@backstage/config';
import {
  AnalyticsApi,
  AnalyticsEvent,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { AnalyticsBrowser } from '@segment/analytics-next';

/**
 * Segment provider for the Backstage Analytics API.
 * @public
 */
export class SegmentAnalytics implements AnalyticsApi {
  private readonly analytics: AnalyticsBrowser;
  private readonly testMode: boolean;
  private readonly maskIP: boolean;
  private readonly identityApi: IdentityApi | undefined;

  /**
   * Instantiate the implementation and initialize Segment client.
   */
  private constructor(
    options: { writeKey: string; testMode: boolean; maskIP: boolean },
    identityApi?: IdentityApi,
  ) {
    const { writeKey, testMode, maskIP } = options;
    this.identityApi = identityApi;
    this.testMode = testMode;
    this.maskIP = maskIP;
    this.analytics = new AnalyticsBrowser();
    this.analytics.load({ writeKey: writeKey });
  }

  /**
   * Instantiate a fully configured Segment API implementation.
   */
  static fromConfig(config: Config, identityApi?: IdentityApi) {
    const testMode =
      config.getOptionalBoolean('app.analytics.segment.testMode') ?? false;
    const writeKey = testMode
      ? ''
      : config.getString('app.analytics.segment.writeKey');
    const maskIP =
      config.getOptionalBoolean('app.analytics.segment.maskIP') ?? false;

    return new SegmentAnalytics(
      {
        writeKey,
        testMode,
        maskIP,
      },
      identityApi,
    );
  }

  async captureEvent(event: AnalyticsEvent) {
    // Don't capture events in test mode.
    if (this.testMode) {
      return;
    }
    const analyticsOpts = this.maskIP ? { ip: '0.0.0.0' } : {};
    const { action, subject, context, attributes } = event;

    // Identify users.
    if (action === 'identify') {
      let userId = '';
      if (this.identityApi) {
        const { userEntityRef } = await this.identityApi.getBackstageIdentity();
        userId = await this.getPIIFreeUserID(userEntityRef);
      } else {
        userId = await this.getPIIFreeUserID(subject);
      }
      await this.analytics.identify(userId, {}, analyticsOpts);
      return;
    }

    // Track page views.
    if (action === 'navigate') {
      await this.analytics.page(
        context.pluginId,
        subject,
        context,
        analyticsOpts,
      );
      return;
    }

    // Track other events.
    await this.analytics.track(
      action,
      {
        subject: subject,
        context: context,
        attributes: attributes,
      },
      analyticsOpts,
    );
  }

  private async getPIIFreeUserID(userId: string): Promise<string> {
    return this.hash(userId);
  }

  private async hash(value: string): Promise<string> {
    if (!value) return value;
    const digest = await window.crypto.subtle.digest(
      'sha-256',
      new TextEncoder().encode(value),
    );
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
