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
import { getFileSize } from './get-file-size';

describe('getFileSize', () => {
  it('should return the correct file size for manifest 2, schema 2', () => {
    const component = {
      assets: [
        {
          fileSize: 1,
        },
        {
          fileSize: 20,
        },
      ],
    };
    const dockerManifests = [
      {
        schemaVersion: 2 as const,
        mediaType:
          'application/vnd.docker.distribution.manifest.v2+json' as const,
        layers: [
          {
            size: 300,
            mediaType: '',
            digest: '',
          },
          {
            size: 4000,
            mediaType: '',
            digest: '',
          },
        ],
        config: {
          size: 50000,
          mediaType: '',
          digest: '',
        },
      },
      null,
    ];
    expect(getFileSize({ component, dockerManifests })).toBe(54321);
  });
  it('should return the correct file size for manifest 2, schema 1', () => {
    const component = {
      assets: [
        {
          fileSize: 111,
        },
      ],
    };
    const dockerManifests = [
      {
        schemaVersion: 1 as const,
        name: '',
        tag: '',
        architecture: '',
        fsLayers: [
          {
            blobSum: '',
          },
        ],
        history: [
          {
            v1Compatibility: '',
          },
        ],
      },
      null,
    ];
    expect(getFileSize({ component, dockerManifests })).toBe(111);
  });
});
