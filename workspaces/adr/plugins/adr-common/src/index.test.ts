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
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import { ANNOTATION_ADR_LOCATION, getAdrLocationUrl } from './index';

const scmIntegrations = ScmIntegrations.fromConfig(
  new ConfigReader({
    integrations: {
      bitbucketServer: [
        {
          host: 'bitbucket.example.com',
          apiBaseUrl: 'https://bitbucket.example.com/rest/api/1.0',
        },
      ],
    },
  }),
);

const createEntity = (
  sourceLocation: string,
  adrLocation = 'docs/adrs',
): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test',
    annotations: {
      'backstage.io/source-location': `url:${sourceLocation}`,
      [ANNOTATION_ADR_LOCATION]: adrLocation,
    },
  },
});

const resolve = (
  sourceLocation: string,
  adrFilePath?: string,
  adrLocation?: string,
) =>
  getAdrLocationUrl(
    createEntity(sourceLocation, adrLocation),
    scmIntegrations,
    adrFilePath,
  );

describe('getAdrLocationUrl', () => {
  it('resolves ADR locations for Bitbucket Server source locations', () => {
    const repo = 'https://bitbucket.example.com/projects/PROJ/repos/repo';

    // Source locations that already point at repository content
    expect(resolve(`${repo}/browse/`)).toBe(`${repo}/browse/docs/adrs`);
    expect(resolve(`${repo}/browse/`, '0001-adr.md')).toBe(
      `${repo}/browse/docs/adrs/0001-adr.md`,
    );
    expect(resolve(`${repo}/browse/projects/a/repos/b/`)).toBe(
      `${repo}/browse/projects/a/repos/b/docs/adrs`,
    );
    expect(resolve(`${repo}/browse/?at=refs%2Fheads%2Fmain`)).toBe(
      `${repo}/browse/docs/adrs?at=refs%2Fheads%2Fmain`,
    );
    expect(
      resolve(`${repo}/browse/?at=refs%2Fheads%2Fmain`, '0001-adr.md'),
    ).toBe(`${repo}/browse/docs/adrs/0001-adr.md?at=refs%2Fheads%2Fmain`);

    // Source locations pointing at the repository without a /browse/ segment
    expect(resolve(`${repo}/`)).toBe(`${repo}/browse/docs/adrs`);
    expect(resolve(`${repo}/`, '0001-adr.md')).toBe(
      `${repo}/browse/docs/adrs/0001-adr.md`,
    );
    expect(resolve(repo)).toBe(`${repo}/browse/docs/adrs`);
    expect(resolve(`${repo}/catalog-info.yaml`)).toBe(
      `${repo}/browse/docs/adrs`,
    );
    expect(resolve(`${repo}/?at=refs%2Fheads%2Fmain`, '0001-adr.md')).toBe(
      `${repo}/browse/docs/adrs/0001-adr.md?at=refs%2Fheads%2Fmain`,
    );

    // Personal repositories and different annotation formats
    expect(
      resolve('https://bitbucket.example.com/users/jdoe/repos/repo/'),
    ).toBe(
      'https://bitbucket.example.com/users/jdoe/repos/repo/browse/docs/adrs',
    );
    expect(resolve(`${repo}/`, undefined, '/docs/adrs/')).toBe(
      `${repo}/browse/docs/adrs`,
    );
    expect(resolve(`${repo}/`, undefined, './docs/adrs')).toBe(
      `${repo}/browse/docs/adrs`,
    );
  });

  it('leaves source locations for other providers unchanged', () => {
    expect(resolve('https://github.com/org/repo/tree/main/')).toBe(
      'https://github.com/org/repo/tree/main/docs/adrs',
    );
    expect(
      resolve('https://github.com/org/repo/tree/main/', '0001-adr.md'),
    ).toBe('https://github.com/org/repo/tree/main/docs/adrs/0001-adr.md');
    expect(resolve('https://gitlab.com/org/repo/-/tree/main/')).toBe(
      'https://gitlab.com/org/repo/-/tree/main/docs/adrs',
    );
    expect(resolve('https://bitbucket.org/org/repo/src/main/')).toBe(
      'https://bitbucket.org/org/repo/src/main/docs/adrs',
    );
    expect(
      resolve(
        'https://bitbucket.example.com/projects/PROJ/repos/repo/browse/',
        undefined,
        'https://github.com/org/other/tree/main/adrs',
      ),
    ).toBe('https://github.com/org/other/tree/main/adrs');
  });

  it('throws when the ADR annotation is missing', () => {
    const entity = createEntity('https://github.com/org/repo/tree/main/');
    delete entity.metadata.annotations![ANNOTATION_ADR_LOCATION];

    expect(() => getAdrLocationUrl(entity, scmIntegrations)).toThrow(
      `Missing ADR annotation: ${ANNOTATION_ADR_LOCATION}`,
    );
  });
});
