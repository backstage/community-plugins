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

import { resolveCreateSecretRequest } from './createSecretUtils';

describe('resolveCreateSecretRequest', () => {
  it('resolves a relative secret name under the selected path', () => {
    expect(
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '/demo/prod',
        secretPaths: ['/demo/prod'],
      }),
    ).toEqual({
      absoluteName: '/demo/prod/secret',
      contextPath: '/demo/prod',
    });
  });

  it('preserves an absolute secret name', () => {
    expect(
      resolveCreateSecretRequest({
        name: '/demo/prod/secret',
        selectedPath: '/demo/prod',
        secretPaths: ['/demo/prod'],
      }),
    ).toEqual({
      absoluteName: '/demo/prod/secret',
      contextPath: '/demo/prod',
    });
  });

  it('selects the longest matching annotated path for nested prefixes', () => {
    expect(
      resolveCreateSecretRequest({
        name: 'b/secret',
        selectedPath: '/a',
        secretPaths: ['/a', '/a/b'],
      }),
    ).toEqual({
      absoluteName: '/a/b/secret',
      contextPath: '/a/b',
    });
  });

  it('normalizes annotated paths with trailing slashes', () => {
    expect(
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '/demo/prod/',
        secretPaths: ['/demo/prod/'],
      }),
    ).toEqual({
      absoluteName: '/demo/prod/secret',
      contextPath: '/demo/prod',
    });
  });

  it('rejects root context paths', () => {
    expect(() =>
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '/',
        secretPaths: ['/'],
      }),
    ).toThrow(
      'Cannot create static secrets with a root contextPath; set a non-root akeyless.io/secrets-path',
    );
  });
});
