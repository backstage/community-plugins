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
import type { AssetXO } from '../../types';

// Extensions we don't want to fetch extra data for, and don't want to display
// as their own entity.
const MAVEN_IGNORED_ASSET_EXTENSIONS = new Set<string>([
  'pom',
  'sha1',
  'md5',
  'sha256',
]);

// Whether an asset has data we might want to fetch, and/or display as its own
// entity.
export function isPrimaryAsset(asset: AssetXO): boolean {
  if (!asset.maven2) {
    return true;
  }
  const { extension } = asset.maven2;
  if (extension === undefined) {
    return true;
  }
  // Extension can be `jar.md5` or `zip.sha1`, for example
  return !MAVEN_IGNORED_ASSET_EXTENSIONS.has(extension.split('.').pop() ?? '');
}
