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

export { akeylessPlugin, EntityAkeylessCard } from './plugin';
export { isAkeylessAvailable } from './conditions';
export {
  AKEYLESS_SECRET_PATH_ANNOTATION,
  AKEYLESS_SECRET_TYPES_ANNOTATION,
  AKEYLESS_ALLOW_CRUD_ANNOTATION,
  DEFAULT_SECRET_TYPES,
} from './constants';
export { akeylessApiRef } from './api';
export type {
  AkeylessApi,
  AkeylessSecret,
  ListSecretsResponse,
  StaticSecretValueResponse,
} from './api';
