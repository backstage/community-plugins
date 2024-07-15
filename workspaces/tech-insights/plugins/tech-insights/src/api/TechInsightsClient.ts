/*
 * Copyright 2021 The Backstage Authors
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

import { TechInsightsApi } from './TechInsightsApi';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { TechInsightsClient as TechInsightsClientBase } from '@backstage-community/plugin-tech-insights-client';

import {
  CheckResultRenderer,
  jsonRulesEngineCheckResultRenderer,
} from '../components/CheckResultRenderer';

/** @public */
export class TechInsightsClient
  extends TechInsightsClientBase
  implements TechInsightsApi
{
  private readonly renderers?: CheckResultRenderer[];

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    renderers?: CheckResultRenderer[];
  }) {
    super(options);
    this.renderers = options.renderers;
  }

  getCheckResultRenderers(types: string[]): CheckResultRenderer[] {
    const renderers = this.renderers ?? [jsonRulesEngineCheckResultRenderer];
    return renderers.filter(d => types.includes(d.type));
  }
}
