import { Config } from '@backstage/config';

/**
 * @public
 */
export interface BlackDuckHostConfig {
  name: string;
  host: string;
  token: string;
}

/**
 * blackduckPlugin config
 *
 * @public
 */
export class BlackDuckConfig {
  constructor(
    private readonly hosts: BlackDuckHostConfig[],
    private readonly defaultHost: string,
  ) {}

  static fromConfig(config: Config): BlackDuckConfig {
    let hosts: BlackDuckHostConfig[] = [];
    let defaultHost: string = 'default';

    if (config.has('blackduck.host') && config.has('blackduck.token')) {
      const singleHost = {
        name: 'default',
        host: config.getString('blackduck.host'),
        token: config.getString('blackduck.token'),
      };
      hosts = [singleHost];
    }

    if (config.has('blackduck.hosts')) {
      hosts = config.getConfigArray('blackduck.hosts').map(hostConfig => ({
        name: hostConfig.getString('name'),
        host: hostConfig.getString('host'),
        token: hostConfig.getString('token'),
      }));
      defaultHost = config.getString('blackduck.default');
    }

    return new BlackDuckConfig(hosts, defaultHost);
  }

  getHostConfigByName(name: string): BlackDuckHostConfig {
    const hostName = name === 'default' ? this.defaultHost : name;

    const hostConfig = this.hosts.find(host => host.name === hostName);

    if (!hostConfig) {
      throw new Error(`No host found with name: ${name}`);
    }

    return hostConfig;
  }
}
