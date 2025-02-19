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

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  ...require('@spotify/prettier-config'),
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react(.*)$',
    '',
    '^@backstage/(.*)$',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@backstage-community/(.*)$',
    '',
    '<BUILTIN_MODULES>',
    '',
    '^[.]',
  ],
};
