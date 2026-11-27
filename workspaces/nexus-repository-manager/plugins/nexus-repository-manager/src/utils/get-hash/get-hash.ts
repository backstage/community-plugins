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
import { AssetHash, AssetXO } from '../../types';

export function getHash(asset: AssetXO | undefined): AssetHash | undefined {
  if (!asset?.checksum) {
    return undefined;
  }

  // SHA-1/MD5 are the defaults for Maven
  // SHA-1 picked over MD5 as it seems to always be present
  // @see {@link https://maven.apache.org/resolver/about-checksums.html}
  if (asset.format === 'maven2' && 'sha1' in asset.checksum) {
    return {
      algorithm: 'sha1',
      value: String(asset.checksum.sha1),
    };
  }

  // The checksum should be present with a sha256
  if ('sha256' in asset.checksum) {
    return {
      algorithm: 'sha256',
      value: String(asset.checksum.sha256),
    };
  }

  return undefined;
}
