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

  it('normalizes repeated slashes in annotated paths', () => {
    expect(
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '/demo////prod///',
        secretPaths: ['/demo////prod///'],
      }),
    ).toEqual({
      absoluteName: '/demo/prod/secret',
      contextPath: '/demo/prod',
    });
  });

  it('treats slash-only paths as root', () => {
    expect(() =>
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '////',
        secretPaths: ['/demo'],
      }),
    ).toThrow(
      'Cannot create static secrets with a root contextPath; set a non-root akeyless.io/secrets-path',
    );
  });

  it('resolves . and .. segments like the backend path normalizer', () => {
    expect(
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '/demo/./prod/../prod',
        secretPaths: ['/demo/./prod'],
      }),
    ).toEqual({
      absoluteName: '/demo/prod/secret',
      contextPath: '/demo/prod',
    });
  });

  it('treats ./ paths as root context paths', () => {
    expect(() =>
      resolveCreateSecretRequest({
        name: 'secret',
        selectedPath: '/./',
        secretPaths: ['/demo'],
      }),
    ).toThrow(
      'Cannot create static secrets with a root contextPath; set a non-root akeyless.io/secrets-path',
    );
  });

  it('rejects secret names that traverse above root', () => {
    expect(() =>
      resolveCreateSecretRequest({
        name: '../../outside',
        selectedPath: '/demo',
        secretPaths: ['/demo'],
      }),
    ).toThrow('Invalid path: cannot traverse above root');
  });

  it('resolves relative traversal in secret names before context matching', () => {
    expect(
      resolveCreateSecretRequest({
        name: '../sibling/secret',
        selectedPath: '/demo/prod',
        secretPaths: ['/demo', '/demo/prod'],
      }),
    ).toEqual({
      absoluteName: '/demo/sibling/secret',
      contextPath: '/demo',
    });
  });
});
