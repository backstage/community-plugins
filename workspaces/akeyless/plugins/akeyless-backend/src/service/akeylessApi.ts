/*
 * Copyright 2025 The Backstage Authors
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

import { NotAllowedError, NotFoundError } from '@backstage/errors';
import * as akeyless from 'akeyless';
import * as akeylessCloudId from 'akeyless-cloud-id';
import plimit from 'p-limit';
import { AkeylessConfig } from '../config';
import { normalizePath } from '../pathUtils';

export type AkeylessSecret = {
  name: string;
  fullPath: string;
  itemType: string;
  path: string;
  showUrl: string;
  editUrl: string;
};

export interface AkeylessApi {
  getConsoleUrl(): string;
  listSecrets(
    secretPath: string,
    itemTypes?: string[],
  ): Promise<AkeylessSecret[]>;
  getStaticSecretValue(name: string): Promise<string>;
  createStaticSecret(name: string, value: string): Promise<void>;
  updateStaticSecretValue(name: string, value: string): Promise<void>;
  deleteItem(name: string): Promise<void>;
}

type ListItem = {
  item_name?: string;
  item_type?: string;
};

type SecretValueResponse = {
  value?: string;
};

function relativeName(fullPath: string, basePath: string): string {
  const normalizedBase = normalizePath(basePath).replace(/\/$/, '');
  if (fullPath === normalizedBase) {
    return fullPath.split('/').pop() ?? fullPath;
  }
  if (fullPath.startsWith(`${normalizedBase}/`)) {
    return fullPath.slice(normalizedBase.length + 1);
  }
  return fullPath;
}

function toAkeylessError(error: unknown, fallbackMessage: string): Error {
  const status = (error as { status?: number }).status;
  if (status === 404) {
    return new NotFoundError(fallbackMessage);
  }
  if (status === 403) {
    return new NotAllowedError('Not allowed to access Akeyless item');
  }
  return error instanceof Error ? error : new Error(String(error));
}

export class AkeylessClient implements AkeylessApi {
  private readonly config: AkeylessConfig;
  private readonly api: {
    auth: (body: unknown) => Promise<{ token: string }>;
    listItems: (body: unknown) => Promise<{
      items?: ListItem[];
      folders?: string[];
    }>;
    getSecretValue: (body: unknown) => Promise<SecretValueResponse>;
    createSecret: (body: unknown) => Promise<unknown>;
    updateSecretVal: (body: unknown) => Promise<unknown>;
    deleteItem: (body: unknown) => Promise<unknown>;
  };
  private readonly limit = plimit(5);
  private token?: string;

  constructor(config: AkeylessConfig) {
    this.config = config;
    const client = new akeyless.ApiClient();
    client.basePath = config.gatewayUrl.replace(/\/$/, '');
    this.api = new akeyless.V2Api(client);
  }

  getConsoleUrl(): string {
    return this.config.consoleUrl.replace(/\/$/, '');
  }

  private getItemUrl(itemName: string, itemType: string): string {
    const consoleUrl = this.getConsoleUrl();
    const params = new URLSearchParams({
      item: itemName,
      type: itemType,
    });
    return `${consoleUrl}/items?${params.toString()}`;
  }

  private async authenticate(): Promise<string> {
    const auth = this.config.authentication;

    if (auth.method === 'accessKey' && auth.accessKey) {
      const result = await this.api.auth(
        akeyless.Auth.constructFromObject({
          'access-id': auth.accessKey.accessId,
          'access-type': 'access_key',
          'access-key': auth.accessKey.accessKey,
        }),
      );
      return result.token;
    }

    if (auth.method === 'universalIdentity' && auth.universalIdentity) {
      const result = await this.api.auth(
        akeyless.Auth.constructFromObject({
          'access-type': 'universal_identity',
          'uid-token': auth.universalIdentity.uidToken,
        }),
      );
      return result.token;
    }

    if (auth.method === 'cloudIam' && auth.cloudIam) {
      const cloudId = await new Promise<string>((resolve, reject) => {
        akeylessCloudId.getCloudId(auth.cloudIam!.provider, '', (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res ?? '');
        });
      });
      const result = await this.api.auth(
        akeyless.Auth.constructFromObject({
          'access-id': auth.cloudIam.accessId,
          'access-type': auth.cloudIam.provider,
          'cloud-id': cloudId,
        }),
      );
      return result.token;
    }

    throw new Error('Akeyless authentication is not configured');
  }

  private async getToken(): Promise<string> {
    if (!this.token) {
      this.token = await this.authenticate();
    }
    return this.token;
  }

  private async listAtPath(
    path: string,
    itemTypes: string[],
    basePath: string,
    secrets: AkeylessSecret[],
  ): Promise<void> {
    const token = await this.getToken();
    let response: { items?: ListItem[]; folders?: string[] };

    try {
      response = await this.limit(() =>
        this.api.listItems(
          akeyless.ListItems.constructFromObject({
            path: normalizePath(path),
            type: itemTypes,
            token,
            currentFolder: true,
            autoPagination: 'enabled',
          }),
        ),
      );
    } catch (error: unknown) {
      throw toAkeylessError(error, `No secrets found in path '${basePath}'`);
    }

    for (const item of response.items ?? []) {
      const fullPath = item.item_name;
      const itemType = item.item_type;
      if (!fullPath || !itemType) {
        continue;
      }

      secrets.push({
        name: relativeName(fullPath, basePath),
        fullPath,
        itemType,
        path: basePath,
        showUrl: this.getItemUrl(fullPath, itemType),
        editUrl: this.getItemUrl(fullPath, itemType),
      });
    }

    for (const folder of response.folders ?? []) {
      await this.listAtPath(folder, itemTypes, basePath, secrets);
    }
  }

  async listSecrets(
    secretPath: string,
    itemTypes: string[] = [
      'static-secret',
      'dynamic-secret',
      'rotated-secret',
      'certificate',
    ],
  ): Promise<AkeylessSecret[]> {
    const normalizedPath = normalizePath(secretPath);
    const secrets: AkeylessSecret[] = [];
    await this.listAtPath(normalizedPath, itemTypes, normalizedPath, secrets);
    return secrets;
  }

  async getStaticSecretValue(name: string): Promise<string> {
    const token = await this.getToken();

    try {
      const response = await this.api.getSecretValue(
        akeyless.GetSecretValue.constructFromObject({
          name: normalizePath(name),
          token,
        }),
      );
      return response.value ?? '';
    } catch (error: unknown) {
      throw toAkeylessError(error, `Static secret '${name}' was not found`);
    }
  }

  async createStaticSecret(name: string, value: string): Promise<void> {
    const token = await this.getToken();

    try {
      await this.api.createSecret(
        akeyless.CreateSecret.constructFromObject({
          name: normalizePath(name),
          value,
          token,
        }),
      );
    } catch (error: unknown) {
      throw toAkeylessError(error, `Failed to create static secret '${name}'`);
    }
  }

  async updateStaticSecretValue(name: string, value: string): Promise<void> {
    const token = await this.getToken();

    try {
      await this.api.updateSecretVal(
        akeyless.UpdateSecretVal.constructFromObject({
          name: normalizePath(name),
          value,
          token,
        }),
      );
    } catch (error: unknown) {
      throw toAkeylessError(error, `Failed to update static secret '${name}'`);
    }
  }

  async deleteItem(name: string): Promise<void> {
    const token = await this.getToken();

    try {
      await this.api.deleteItem(
        akeyless.DeleteItem.constructFromObject({
          name: normalizePath(name),
          token,
        }),
      );
    } catch (error: unknown) {
      throw toAkeylessError(error, `Failed to delete item '${name}'`);
    }
  }
}
