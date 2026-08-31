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

type AkeylessApiClient = {
  basePath: string;
};

type AkeylessV2Api = {
  auth: (body: unknown) => Promise<{ token: string }>;
  listItems: (body: unknown) => Promise<{
    items?: Array<{ item_name?: string; item_type?: string }>;
    folders?: string[];
  }>;
  getSecretValue: (body: unknown) => Promise<{ value?: string }>;
  createSecret: (body: unknown) => Promise<unknown>;
  updateSecretVal: (body: unknown) => Promise<unknown>;
  deleteItem: (body: unknown) => Promise<unknown>;
};

type AkeylessSdk = {
  ApiClient: new () => AkeylessApiClient;
  V2Api: new (client: unknown) => AkeylessV2Api;
  Auth: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  ListItems: {
    constructFromObject: (obj: Record<string, unknown>) => unknown;
  };
  GetSecretValue: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  CreateSecret: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  UpdateSecretVal: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  DeleteItem: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
};

type AkeylessCloudIdSdk = {
  getCloudId: (
    provider: string,
    param: string,
    callback: (err: Error | undefined, res: string | undefined) => void,
  ) => void;
};

// The akeyless npm packages ship without TypeScript types; wrap them locally.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const akeyless = require('akeyless') as AkeylessSdk;
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const akeylessCloudId =
  require('akeyless-cloud-id') as AkeylessCloudIdSdk;
