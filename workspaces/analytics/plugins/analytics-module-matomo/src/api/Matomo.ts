/*
 * Copyright 2024 The Backstage Authors
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
  AnalyticsEvent,
  ConfigApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { loadMatomo } from './loadMatomo';

declare const window: Window &
  typeof globalThis & {
    _paq: any[];
  };

/**
 * @public
 */
export class MatomoAnalytics implements AnalyticsApi {
  private constructor(options: {
    matomoUrl: string;
    siteId: number;
    identity: string;
    identityApi?: IdentityApi;
    sendPlainUserId?: boolean;
  }) {
    loadMatomo(options.matomoUrl, options.siteId);

    /* Add user tracking if identity is enabled and identityApi is provided */
    if (options.identity !== 'disabled' && options.identityApi) {
      this.setUserFrom(options.identityApi, options.sendPlainUserId).catch(
        () => {
          return;
        },
      );
    }
  }

  static fromConfig(
    config: ConfigApi,
    options?: {
      identityApi?: IdentityApi;
    },
  ) {
    const identity =
      config.getOptionalString('app.analytics.matomo.identity') || 'disabled';

    const sendPlainUserId = config.getOptionalBoolean(
      'app.analytics.matomo.sendPlainUserId',
    );

    const matomoUrl = config.getString('app.analytics.matomo.host');
    const siteId = config.getNumber('app.analytics.matomo.siteId');

    if (identity === 'required' && !options?.identityApi) {
      throw new Error(
        'Invalid config: identity API must be provided to deps when app.matomo.identity is required',
      );
    }

    return new MatomoAnalytics({
      matomoUrl,
      siteId,
      identity,
      identityApi: options?.identityApi,
      sendPlainUserId,
    });
  }

  captureEvent(event: AnalyticsEvent) {
    const { context, action, subject, value } = event;
    // REF: https://github.com/backstage/community-plugins/blob/main/workspaces/analytics/plugins/analytics-module-ga/src/apis/implementations/AnalyticsApi/GoogleAnalytics.ts#L160
    // REF: https://matomo.org/faq/reports/implement-event-tracking-with-matomo/
    window._paq.push([
      'trackEvent',
      context.extension || 'App',
      action,
      subject,
      value,
    ]);
  }

  private async setUserFrom(
    identityApi: IdentityApi,
    sendPlainUserId?: boolean,
  ) {
    const { userEntityRef } = await identityApi.getBackstageIdentity();

    if (sendPlainUserId) {
      window._paq.push(['setUserId', userEntityRef]);
    } else {
      // Prevent PII from being passed to Matomo
      const userId = await this.getPrivateUserId(userEntityRef);

      window._paq.push(['setUserId', userId]);
    }
  }

  private getPrivateUserId(userEntityRef: string): Promise<string> {
    return this.hash(userEntityRef);
  }

  private async hash(value: string): Promise<string> {
    const digest = await window.crypto.subtle.digest(
      'sha-256',
      new TextEncoder().encode(value),
    );
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
