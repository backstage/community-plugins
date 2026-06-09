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

declare module 'akeyless' {
  export const ApiClient: new () => {
    basePath: string;
  };
  export const V2Api: new (client: unknown) => {
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
  export const Auth: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  export const ListItems: {
    constructFromObject: (obj: Record<string, unknown>) => unknown;
  };
  export const GetSecretValue: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  export const CreateSecret: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  export const UpdateSecretVal: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
  export const DeleteItem: {
    constructFromObject: (obj: Record<string, string>) => unknown;
  };
}

declare module 'akeyless-cloud-id' {
  export function getCloudId(
    provider: string,
    param: string,
    callback: (err: Error | undefined, res: string | undefined) => void,
  ): void;
}
