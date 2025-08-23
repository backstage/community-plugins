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
import type { LoggerService } from '@backstage/backend-plugin-api';
import supported from '../kiali_supported.json';
import { KialiDetails } from '../service/config';
import { KialiFetcher, KialiValidations, ValidationCategory } from './fetch';

export type Options = {
  logger: LoggerService;
  kiali: KialiDetails;
};

export const KIALI_CORE_VERSION = 'Kiali version';

type Status = { [K: string]: string };

interface StatusState {
  status: Status;
}

export interface KialiApi {
  proxy(endpoint: string, method?: string): Promise<any>;
}
export class KialiApiImpl implements KialiApi {
  private kialiFetcher: KialiFetcher;
  private logger: LoggerService;

  constructor(options: Options) {
    this.logger = options.logger;
    options.logger.debug(`creating kiali client with url=${options.kiali.url}`);
    this.kialiFetcher = new KialiFetcher(options.kiali, options.logger);
  }

  cleanVersion = (version: string): Number[] | undefined => {
    const match = version.match(/^v?(\d+\.\d+\.\d+)/);
    return match ? match[1].split('.').map(Number) : undefined;
  };

  /*
   *  -1 => v1 is minor than v2
   *  0 => v1 is equal v2
   *  +1 => v1 is major than v2
   */
  compareVersions = (v1: string, v2: string): number => {
    const parts1 = this.cleanVersion(v1);
    const parts2 = this.cleanVersion(v2);

    if (!parts1 || !parts2) {
      return -1;
    }

    const length = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < length; i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;

      if (a > b) return 1;
      if (a < b) return -1;
    }

    return 0;
  };

  supportedVersion = (version: string): string | undefined => {
    this.logger.info('Validating kiali version');
    this.logger.info(
      `Kiali Version supported ${supported[KIALI_CORE_VERSION]}`,
    );
    if (this.compareVersions(supported[KIALI_CORE_VERSION], version) > 0) {
      return `Kiali version supported is ${supported[KIALI_CORE_VERSION]}, we found version ${version}`;
    }

    return undefined;
  };

  async proxy(endpoint: string): Promise<any> {
    const authValid = await this.kialiFetcher.checkSession();
    if (authValid.verify) {
      this.logger.debug(
        `Authenticated user : ${
          this.kialiFetcher.getAuthData().sessionInfo.username
        }`,
      );
      return this.kialiFetcher
        .newRequest<any>(endpoint, false)
        .then(resp => resp.data);
    }
    this.logger.debug(
      `Authentication failed : ${
        authValid.missingAttributes &&
        `Missing attributes: [${authValid.missingAttributes?.join(',')}] .`
      } ${authValid.message}`,
    );
    return Promise.resolve(authValid);
  }

  async status(): Promise<any> {
    const validations = await this.kialiFetcher.checkSession();
    if (validations.verify) {
      return this.kialiFetcher.newRequest<any>('api/status').then(resp => {
        const st: StatusState = resp.data;
        const versionControl = this.supportedVersion(
          st.status[KIALI_CORE_VERSION],
        );
        if (versionControl) {
          const response: KialiValidations = {
            verify: false,
            category: ValidationCategory.versionSupported,
            title: 'kiali version not supported',
            message: versionControl,
          };
          return Promise.resolve(response);
        }
        return Promise.resolve(resp.data);
      });
    }
    return Promise.resolve(validations);
  }
}
