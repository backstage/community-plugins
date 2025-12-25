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
  AnalyticsEvent as LegacyAnalyticsEvent,
  ConfigApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import {
  AnalyticsImplementation,
  AnalyticsEvent,
} from '@backstage/frontend-plugin-api';

import { loadMatomo } from './loadMatomo';

export type PaqArg = string | number | undefined;
export type PaqCommand = PaqArg[];
declare const window: Window &
  typeof globalThis & {
    _paq: PaqCommand[];
    __MATOMO_INITIAL_PV_SENT?: boolean;
    __MATOMO_INITIAL_PV_TS?: number;
  };
const pushPaq = (...args: PaqArg[]) => window._paq.push(args);

type NormalizedMatomoEvent = {
  action: string;
  subject?: string;
  value?: number;
  context: {
    extension?: string;
    extensionId?: string;
  };
};

/**
 * @public
 */
export class MatomoAnalytics implements AnalyticsApi, AnalyticsImplementation {
  private readonly enhancedTracking: boolean;
  private readonly deferInitialPageView: boolean;
  private userIdSet = false;
  private pageViewSent = false;
  private pendingEvents: NormalizedMatomoEvent[] = [];

  private constructor(options: {
    matomoUrl: string;
    siteId: number;
    identity: string;
    identityApi?: IdentityApi;
    sendPlainUserId?: boolean;
    enhancedTracking?: boolean;
    deferInitialPageView?: boolean;
  }) {
    this.enhancedTracking = !!options.enhancedTracking;
    this.deferInitialPageView =
      this.enhancedTracking && !!options.deferInitialPageView;
    this.userIdSet = !this.enhancedTracking && options.identity === 'disabled';

    loadMatomo(options.matomoUrl, options.siteId);
    // Initial PV unless explicitly deferred (enhancedTracking + deferInitialPageView)
    if (!this.enhancedTracking || !this.deferInitialPageView) {
      this.trackInitialPageView();
    }
    if (options.identity !== 'disabled' && options.identityApi) {
      const shouldNotifyReady = true;

      this.setUserFrom(
        options.identityApi,
        options.sendPlainUserId,
        shouldNotifyReady,
      ).catch(() => {});
    } else if (!this.userIdSet) {
      this.onIdentityReady();
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

    const enhancedTracking = config.getOptionalBoolean(
      'app.analytics.matomo.enhancedTracking',
    );

    const deferInitialPageView = config.getOptionalBoolean(
      'app.analytics.matomo.deferInitialPageView',
    );

    const matomoUrl = config.getString('app.analytics.matomo.host');
    const siteId = config.getNumber('app.analytics.matomo.siteId');

    if (identity === 'required' && !options?.identityApi) {
      throw new Error(
        "Invalid config: identity API must be provided when app.analytics.matomo.identity is 'required'",
      );
    }

    return new MatomoAnalytics({
      matomoUrl,
      siteId,
      identity,
      identityApi: options?.identityApi,
      sendPlainUserId,
      enhancedTracking,
      deferInitialPageView,
    });
  }

  captureEvent(event: AnalyticsEvent | LegacyAnalyticsEvent) {
    const normalizedEvent = this.normalizeEvent(event);
    if (!this.userIdSet) {
      this.pendingEvents.push(normalizedEvent); // Buffer until identity ready
      return;
    }
    this.handleNormalizedEvent(normalizedEvent);
  }

  private handleNormalizedEvent(event: NormalizedMatomoEvent) {
    if (event.action === 'navigate') {
      this.trackPageView(event);
      return;
    }
    this.pushEvent(event);
  }

  private normalizeEvent(
    event: AnalyticsEvent | LegacyAnalyticsEvent,
  ): NormalizedMatomoEvent {
    const context = (event.context ?? {}) as NormalizedMatomoEvent['context'];

    return {
      action: event.action,
      subject: event.subject,
      value: event.value,
      context: {
        extension: context.extension,
        extensionId: context.extensionId,
      },
    };
  }

  private pushEvent(event: NormalizedMatomoEvent) {
    pushPaq(
      'trackEvent',
      event.context.extensionId || event.context.extension || 'App',
      event.action,
      event.subject,
      event.value,
    );
  }

  private trackPageView(event: NormalizedMatomoEvent) {
    const subject = event.subject ?? window.location.pathname ?? '/';
    const normalizedSubject = subject.startsWith('/') ? subject : `/${subject}`;
    const fullUrl = `${window.location.origin}${normalizedSubject}`;

    pushPaq('setCustomUrl', fullUrl);
    pushPaq('setDocumentTitle', normalizedSubject);
    pushPaq('trackPageView');

    // Mark global initial PV sentinel if first time; navigate events may serve as initial PV
    if (!window.__MATOMO_INITIAL_PV_SENT) {
      window.__MATOMO_INITIAL_PV_SENT = true;
      window.__MATOMO_INITIAL_PV_TS = Date.now();
    }
    this.pageViewSent = true; // prevent duplicate initial PV within instance
  }

  private trackInitialPageView() {
    if (this.pageViewSent) return;
    // If deferral requested, caller MUST invoke only after identity ready; constructor invokes early only when no deferral
    try {
      if (!window.__MATOMO_INITIAL_PV_SENT) {
        pushPaq('trackPageView');
        window.__MATOMO_INITIAL_PV_SENT = true;
        window.__MATOMO_INITIAL_PV_TS = Date.now();
      }
      this.pageViewSent = true;
    } catch {
      // Matomo script not loaded yet; ignoring initial PV
    }
  }

  private flushPendingEvents() {
    if (!this.pendingEvents.length) {
      return;
    }

    const bufferedEvents = this.pendingEvents.slice();
    this.pendingEvents = [];
    bufferedEvents.forEach(e => this.handleNormalizedEvent(e));
  }

  private onIdentityReady() {
    this.userIdSet = true;
    // First flush pending events; if a buffered navigate event exists it will send PageView
    this.flushPendingEvents();
    // If no navigate event has set pageViewSent yet, send initial PageView now
    this.trackInitialPageView();
  }

  private async setUserFrom(
    identityApi: IdentityApi,
    sendPlainUserId?: boolean,
    notifyReady?: boolean,
  ) {
    const { userEntityRef } = await identityApi.getBackstageIdentity();
    const resolvedId = sendPlainUserId
      ? userEntityRef
      : await this.getPrivateUserId(userEntityRef); // hashed ID (no salt)

    pushPaq('setUserId', resolvedId);

    if (notifyReady) this.onIdentityReady();
  }

  private getPrivateUserId(userEntityRef: string): Promise<string> {
    return this.hash(userEntityRef);
  }

  private async hash(value: string): Promise<string> {
    const digest = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value),
    );
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
