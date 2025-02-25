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
import {
  AnalyticsApi,
  IdentityApi,
  ConfigApi,
  AnalyticsEvent,
} from '@backstage/core-plugin-api';

export class InsightsAnalyticsApi implements AnalyticsApi {
  private eventBuffer: AnalyticsEvent[] = [];
  private readonly backendUrl: string;
  private readonly flushInterval: number;
  private readonly maxBufferSize: number;
  private readonly debug?: boolean;
  private userId?: string;
  private userToken?: string;

  private constructor(
    backendUrl: string,
    flushInterval: number,
    maxBufferSize: number,
    identityApi?: IdentityApi,
    debug?: boolean,
  ) {
    this.backendUrl = backendUrl;
    this.flushInterval = flushInterval;
    this.maxBufferSize = maxBufferSize;
    this.debug = debug;

    if (identityApi) {
      identityApi.getBackstageIdentity().then(async identity => {
        const { token } = await identityApi.getCredentials();
        this.userToken = token;
        this.userId = identity.userEntityRef;
      });
    }

    setInterval(() => this.flushEvents(), this.flushInterval);
  }

  static fromConfig(config: ConfigApi, options: { identityApi?: IdentityApi }) {
    const backendUrl = `${config.getString('backend.baseUrl')}/api/insights`;
    const flushInterval =
      config.getOptionalNumber('app.analytics.inisghts.flushInterval') || 5000;
    const maxBufferSize =
      config.getOptionalNumber('app.analytics.insights.maxBufferSize') || 20;
    const debug =
      config.getOptionalBoolean('app.analytics.insights.debug') || false;

    return new InsightsAnalyticsApi(
      backendUrl,
      flushInterval,
      maxBufferSize,
      options.identityApi,
      debug,
    );
  }

  async captureEvent(event: AnalyticsEvent) {
    if (this.userId) {
      event.context.userName = this.userId;
      event.context.userId = await this.hash(this.userId);
    }
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('Analytics Event -', event);
    }

    this.eventBuffer.push(event);

    // Flush immediately if buffer reaches threshold
    if (this.eventBuffer.length >= this.maxBufferSize) {
      await this.flushEvents();
    }
  }

  private async flushEvents() {
    if (this.eventBuffer.length === 0) return;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = []; // Clear buffer before sending to avoid blocking new events

    try {
      await fetch(`${this.backendUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.userToken && { Authorization: `Bearer ${this.userToken}` }),
        },
        body: JSON.stringify(eventsToSend),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to send analytics events, adding the events back to the queue:',
        error,
      );
      // Requeue events if request fails
      this.eventBuffer.unshift(...eventsToSend);
    }
  }

  /**
   * Simple hash function; relies on web cryptography + the sha-256 algorithm.
   * @param value - value to be hashed
   */
  private async hash(value: string): Promise<string> {
    const digest = await window.crypto.subtle.digest(
      'sha-256',
      new TextEncoder().encode(value),
    );
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
