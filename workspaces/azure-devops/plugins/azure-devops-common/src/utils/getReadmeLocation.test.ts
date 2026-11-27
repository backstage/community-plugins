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
import { getReadmeLocation } from './getReadmeLocation';

const entityWith = (annotations: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test',
    annotations: {
      'dev.azure.com/project-repo': 'myProject/myRepo',
      ...annotations,
    },
  },
});

describe('getReadmeLocation', () => {
  it('resolves path and version from the entity annotations', () => {
    expect(getReadmeLocation(entityWith({}))).toEqual({
      path: 'README.md',
      version: undefined,
    });
    expect(
      getReadmeLocation(
        entityWith({ 'dev.azure.com/readme-path': '/docs/README.md' }),
      ),
    ).toEqual({ path: '/docs/README.md', version: undefined });
    expect(
      getReadmeLocation(
        entityWith({
          'dev.azure.com/readme-path': '/docs/README.md&version=GBfeature/foo',
        }),
      ),
    ).toEqual({ path: '/docs/README.md', version: 'GBfeature/foo' });
    expect(
      getReadmeLocation(
        entityWith({
          'backstage.io/source-location':
            'url:https://dev.azure.com/org/myProject/_git/myRepo?path=%2Fservices%2Fsvc&version=GBmain%2Fx',
        }),
      ),
    ).toEqual({ path: '/services/svc/README.md', version: 'GBmain/x' });
    // An explicit readme-path wins over source-location, but source-location
    // still provides the version when readme-path has none
    expect(
      getReadmeLocation(
        entityWith({
          'dev.azure.com/readme-path': '/docs/README.md',
          'backstage.io/source-location':
            'url:https://dev.azure.com/org/myProject/_git/myRepo?path=%2Fservices&version=GBmain',
        }),
      ),
    ).toEqual({ path: '/docs/README.md', version: 'GBmain' });
    expect(
      getReadmeLocation(
        entityWith({ 'dev.azure.com/readme-path': '.github/README.md' }),
      ),
    ).toEqual({ path: '.github/README.md', version: undefined });
  });

  it('only takes the version from Azure DevOps source locations', () => {
    const readmePath = { 'dev.azure.com/readme-path': '/docs/README.md' };
    expect(
      getReadmeLocation(
        entityWith({
          ...readmePath,
          'backstage.io/source-location':
            'url:https://github.com/org/repo/tree/main?version=v2',
        }),
      ),
    ).toEqual({ path: '/docs/README.md', version: undefined });
    expect(
      getReadmeLocation(
        entityWith({
          ...readmePath,
          'backstage.io/source-location':
            'url:https://dev.azure.com/org/myProject/_git/myRepo?version=GB100%',
        }),
      ),
    ).toEqual({ path: '/docs/README.md', version: 'GB100%' });
  });

  it('only allows Markdown files', () => {
    expect(() =>
      getReadmeLocation(
        entityWith({ 'dev.azure.com/readme-path': '/config/prod.env' }),
      ),
    ).toThrow('must point to a Markdown (.md) file');
    expect(() =>
      getReadmeLocation(
        entityWith({
          'dev.azure.com/readme-path': '/config/prod.env&version=GBmain',
        }),
      ),
    ).toThrow('must point to a Markdown (.md) file');
    expect(
      getReadmeLocation(
        entityWith({ 'dev.azure.com/readme-path': '/docs/Readme.MD' }),
      ),
    ).toEqual({ path: '/docs/Readme.MD', version: undefined });
  });

  it('rejects relative readme paths', () => {
    expect(() =>
      getReadmeLocation(
        entityWith({ 'dev.azure.com/readme-path': './docs/README.md' }),
      ),
    ).toThrow('does not support relative paths');
    expect(() =>
      getReadmeLocation(
        entityWith({ 'dev.azure.com/readme-path': '../other/README.md' }),
      ),
    ).toThrow('does not support relative paths');
  });
});
