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
import { Config } from '@backstage/config';

/**
 * @public
 */
export interface BlackDuckHostConfig {
  name: string;
  host: string;
  token: string;
}

const DEFAULT_HOST_NAME = 'default';

/**
 * blackduckPlugin config
 *
 * @public
 */
export class BlackDuckConfig {
  private constructor(
    private readonly hosts: BlackDuckHostConfig[],
    private readonly defaultHost: string,
  ) {}

  static fromConfig(config: Config): BlackDuckConfig {
    let hosts: BlackDuckHostConfig[] = [];
    let defaultHost: string = DEFAULT_HOST_NAME;

    if (config.has('blackduck.host') && config.has('blackduck.hosts')) {
      throw new Error('Cannot have both blackduck.host and blackduck.hosts');
    }

    if (config.has('blackduck.host') && config.has('blackduck.token')) {
      const singleHost = {
        name: 'default',
        host: config.getString('blackduck.host'),
        token: config.getString('blackduck.token'),
      };
      hosts = [singleHost];
    } else if (
      config.has('blackduck.hosts') &&
      config.has('blackduck.default')
    ) {
      hosts = config.getConfigArray('blackduck.hosts').map(hostConfig => ({
        name: hostConfig.getString('name'),
        host: hostConfig.getString('host'),
        token: hostConfig.getString('token'),
      }));
      defaultHost = config.getString('blackduck.default');
    } else {
      throw new Error('Invalid BlackDuck config found');
    }

    return new BlackDuckConfig(hosts, defaultHost);
  }

  getHostConfigByName(name: string): BlackDuckHostConfig {
    const hostName = name === DEFAULT_HOST_NAME ? this.defaultHost : name;

    const hostConfig = this.hosts.find(host => host.name === hostName);

    if (!hostConfig) {
      throw new Error(`No host found with name: ${name}`);
    }

    return hostConfig;
  }
}
