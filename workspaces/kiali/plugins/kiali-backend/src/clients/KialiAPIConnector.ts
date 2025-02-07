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

  supportedVersion = (version: string): string | undefined => {
    this.logger.info('Validating kiali version');
    const versionSupported = supported[KIALI_CORE_VERSION].replace(
      /^./,
      '',
    ).split('.');
    const versionClean = version.replace(/^./, '').split('.');
    this.logger.info(
      `Kiali Version supported ${supported[KIALI_CORE_VERSION]}`,
    );
    if (
      versionSupported[0] === versionClean[0] &&
      versionSupported[1] === versionClean[1]
    ) {
      return undefined;
    }
    return `Kiali version supported is ${supported[KIALI_CORE_VERSION]}, we found version ${version}`;
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
