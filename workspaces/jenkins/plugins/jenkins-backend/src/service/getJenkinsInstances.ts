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

import {
  JenkinsInfo,
  JenkinsInfoProvider,
  JenkinsInfoProviderOptions,
} from './jenkinsInfoProvider';

export type JenkinsInstanceInfo = JenkinsInfo & { instanceName: string };

/**
 * Uses the plural provider API when available and falls back to the legacy
 * single-instance API for custom providers.
 */
export async function getJenkinsInstances(
  provider: JenkinsInfoProvider,
  options: JenkinsInfoProviderOptions,
): Promise<JenkinsInstanceInfo[]> {
  let instances: JenkinsInfo[];
  if (options.instanceName) {
    instances = [await provider.getInstance(options)];
  } else if (provider.getInstances) {
    instances = await provider.getInstances(options);
  } else {
    instances = [await provider.getInstance(options)];
  }

  return instances.map(instance => ({
    ...instance,
    instanceName: instance.instanceName ?? options.instanceName ?? 'default',
  }));
}
