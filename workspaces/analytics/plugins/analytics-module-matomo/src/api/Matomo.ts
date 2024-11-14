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
  analyticsApiRef,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';

import { loadMatomo } from './loadMatomo';

declare const window: Window &
  typeof globalThis & {
    _paq: any[];
  };

type Options = {
  configApi: ConfigApi;
};

/**
 * @public
 */
export class MatomoAnalytics implements AnalyticsApi {
  private readonly configApi: ConfigApi;

  private constructor(options: Options) {
    this.configApi = options.configApi;
    const matomoUrl = this.configApi.getString('app.analytics.matomo.host');
    const matomoSiteId = this.configApi.getNumber(
      'app.analytics.matomo.siteId',
    );
    loadMatomo(matomoUrl, matomoSiteId);
  }

  static fromConfig(config: ConfigApi) {
    return new MatomoAnalytics({ configApi: config });
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
}

/**
 * Api factory method for matomo
 * @public
 */
export const MatomoAnalyticsApi = createApiFactory({
  api: analyticsApiRef,
  deps: { configApi: configApiRef },
  factory: ({ configApi }) => MatomoAnalytics.fromConfig(configApi),
});
