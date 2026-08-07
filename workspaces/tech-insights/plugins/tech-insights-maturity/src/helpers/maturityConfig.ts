/*
 * Copyright 2026 The Backstage Authors
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

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { MaturityDisplayProps } from '../types';

const DEFAULT_TITLE = 'Maturity';
const DEFAULT_HELP_URL =
  'https://github.com/backstage/community-plugins/blob/main/workspaces/tech-insights/plugins/tech-insights-maturity/README.md';

type ConfigApi = {
  getOptionalString(key: string): string | undefined;
};

export type MaturityDisplayConfig = {
  title: string;
  helpUrl: string;
  helpTooltip: string;
};

export function resolveMaturityDisplayConfig(
  configApi: ConfigApi | undefined,
  options: MaturityDisplayProps = {},
): MaturityDisplayConfig {
  const title =
    options.title ??
    configApi?.getOptionalString('techInsights.maturity.title') ??
    DEFAULT_TITLE;

  return {
    title,
    helpUrl:
      configApi?.getOptionalString('techInsights.maturity.help.url') ??
      DEFAULT_HELP_URL,
    helpTooltip:
      configApi?.getOptionalString('techInsights.maturity.help.tooltip') ??
      `Click here to learn more about ${title}!`,
  };
}

export function useMaturityDisplayConfig(
  options: MaturityDisplayProps = {},
): MaturityDisplayConfig {
  return resolveMaturityDisplayConfig(useApi(configApiRef), options);
}
