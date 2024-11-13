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
import type { Config } from '@backstage/config';
import type { JsonObject } from '@backstage/types';

export type CreateActionOptions = {
  config: Config;
};

export type ServiceNowResponses = {
  200:
    | {
        result: JsonObject[];
      }
    | undefined;
  201: {
    result: JsonObject[];
  };
  400: {
    error: {
      message: string;
      detail: string | null;
    };
    status: 'failure';
  };
  401: {
    error: {
      message: 'User Not Authenticated';
      detail: 'Required to provide Auth information';
    };
    status: 'failure';
  };
  404: {
    error: {
      message: string;
      detail: string | null;
    };
    status: 'failure';
  };
};

export type ServiceNowResponse = {
  [key in keyof ServiceNowResponses]: ServiceNowResponses[key];
}[keyof ServiceNowResponses];
