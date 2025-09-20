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
import { createPlugin } from '@backstage/core-plugin-api';
import {
  AnalyticsImplementationBlueprint,
  configApiRef,
  createFrontendPlugin,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { SegmentAnalytics } from './apis/implementations/AnalyticsApi';

/**
 *
 * @public Importing and including this plugin in an app has no effect.
 */
export const analyticsModuleSegment = createPlugin({
  id: 'analytics-provider-segment',
});

const segmentImplementation = AnalyticsImplementationBlueprint.make({
  params: defineParams =>
    defineParams({
      deps: { configApi: configApiRef, identityApi: identityApiRef },
      factory: ({ configApi, identityApi }) =>
        SegmentAnalytics.fromConfig(configApi, { identityApi }),
    }),
});

/**
 * @public
 */
export const analyticsProviderSegmentPlugin = createFrontendPlugin({
  pluginId: 'analytics-provider-segment',
  extensions: [segmentImplementation],
});
