import { Config } from '@backstage/config';

export interface BlackDuckHostConfig {
  name: string;
  host: string;
  token: string;
}

export class BlackDuckConfig {
  constructor(private readonly hosts: BlackDuckHostConfig[]) {}

  static fromConfig(config: Config): BlackDuckConfig {
    const defaultHost = {
      name: 'default',
      host: config.getString('blackduck.host'),
      token: config.getString('blackduck.token'),
    };

    const hosts = [
      defaultHost,
      ...(config.getOptionalConfigArray('blackduck.hosts')?.map(host => ({
        name: host.getString('name'),
        host: host.getString('host'),
        token: host.getString('token'),
      })) ?? []),
    ];

    return new BlackDuckConfig(hosts);
  }

  getHostConfigByName(name: string): BlackDuckHostConfig {
    const hostConfig = this.hosts.find(host => host.name === name);

    if (!hostConfig) {
      throw new Error(`No host found with name: ${name}`);
    }

    return hostConfig;
  }
}
