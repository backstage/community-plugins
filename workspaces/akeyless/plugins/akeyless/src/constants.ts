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

/**
 * Catalog annotation for the Akeyless secrets path (comma-separated paths supported).
 * @public
 */
export const AKEYLESS_SECRET_PATH_ANNOTATION = 'akeyless.io/secrets-path';

/**
 * Optional comma-separated item types to include.
 * Defaults to static, dynamic, rotated, and certificate secrets.
 * @public
 */
export const AKEYLESS_SECRET_TYPES_ANNOTATION = 'akeyless.io/secret-types';

/**
 * Set to "false" to hide in-Backstage CRUD controls (list + Console links remain).
 */
export const AKEYLESS_ALLOW_CRUD_ANNOTATION = 'akeyless.io/allow-crud';

export const DEFAULT_SECRET_TYPES = [
  'static-secret',
  'dynamic-secret',
  'rotated-secret',
  'certificate',
] as const;
