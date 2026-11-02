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

export function mockResource(
  name: string,
  accountId: string,
  region: string,
  type: string,
  configuration: any,
  tags: any,
) {
  const arn = `arn:aws:xxx:${region}:${accountId}:/${name}`;

  const tagsArray = Object.keys(tags).map(key => {
    const value = tags[key];

    return {
      tag: `${key}=${value}`,
      value,
      key,
    };
  });

  return {
    resourceId: arn,
    resourceName: name,
    resourceType: type,
    awsRegion: region,
    accountId: accountId,
    arn,
    tags: tagsArray,
    configuration,
  };
}
