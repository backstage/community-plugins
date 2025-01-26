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
import { TechInsightsClient as TechInsightsClientBase } from '@backstage-community/plugin-tech-insights-common/client';
import {
  CheckLink,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import {
  CheckResultRenderer,
  jsonRulesEngineCheckResultRenderer,
} from '../components/CheckResultRenderer';
import { Entity } from '@backstage/catalog-model';

/** @public */
export class TechInsightsClient
  extends TechInsightsClientBase
  implements TechInsightsApi
{
  private readonly renderers?: CheckResultRenderer[];
  private readonly customGetEntityLinks: (
    result: CheckResult,
    entity: Entity,
  ) => CheckLink[];

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    renderers?: CheckResultRenderer[];
    getEntityLinks?: (result: CheckResult, entity: Entity) => CheckLink[];
  }) {
    super(options);
    this.renderers = options.renderers;
    this.customGetEntityLinks = options.getEntityLinks ?? (() => []);
  }

  getCheckResultRenderers(types: string[]): CheckResultRenderer[] {
    const renderers = this.renderers ?? [jsonRulesEngineCheckResultRenderer];
    return renderers.filter(d => types.includes(d.type));
  }

  isCheckResultFailed(check: CheckResult) {
    const checkResultRenderers = this.getCheckResultRenderers([
      check.check.type,
    ]);
    if (checkResultRenderers[0] && checkResultRenderers[0].isFailed) {
      return checkResultRenderers[0].isFailed(check);
    }
    return true;
  }

  getLinksForEntity(
    result: CheckResult,
    entity: Entity,
    options: { includeStaticLinks?: boolean } = {},
  ): CheckLink[] {
    const links = this.customGetEntityLinks(result, entity);
    if (options.includeStaticLinks) {
      links.push(...(result.check.links ?? []));
    }
    return links;
  }
}
