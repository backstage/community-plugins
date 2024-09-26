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
import { readSchedulerServiceTaskScheduleDefinitionFromConfig } from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';

import { ThreeScaleConfig } from './types';

export function readThreeScaleApiEntityConfigs(
  config: Config,
): ThreeScaleConfig[] {
  const providerConfigs = config.getOptionalConfig(
    'catalog.providers.threeScaleApiEntity',
  );
  if (!providerConfigs) {
    return [];
  }
  return providerConfigs
    .keys()
    .map(id =>
      readThreeScaleApiEntityConfig(id, providerConfigs.getConfig(id)),
    );
}

function readThreeScaleApiEntityConfig(
  id: string,
  config: Config,
): ThreeScaleConfig {
  const baseUrl = config.getString('baseUrl');
  const accessToken = config.getString('accessToken');
  const systemLabel = config.getOptionalString('systemLabel');
  const ownerLabel = config.getOptionalString('ownerLabel');
  const addLabels = config.getOptionalBoolean('addLabels') || true;

  const schedule = config.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('schedule'),
      )
    : undefined;

  return {
    id,
    baseUrl,
    accessToken,
    systemLabel,
    ownerLabel,
    addLabels,
    schedule,
  };
}
