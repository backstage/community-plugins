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
import { createMockDirectory } from '@backstage/backend-test-utils';

import { getObjectToAnnotate } from './getObjectToAnnotate';

const catalogInfoYaml = `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: test-component
spec:
  type: service
`;

describe('getObjectToAnnotate', () => {
  const mockDir = createMockDirectory();
  const workspacePath = mockDir.resolve('workspace');

  afterEach(() => {
    mockDir.clear();
  });

  it('reads the default catalog-info.yaml from the workspace', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'catalog-info.yaml': catalogInfoYaml,
      },
    });

    const entity = await getObjectToAnnotate(workspacePath, undefined);

    expect(entity).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-component',
      },
      spec: {
        type: 'service',
      },
    });
  });

  it('reads a custom entity file path from the workspace', async () => {
    mockDir.setContent({
      [workspacePath]: {
        'custom-entity.yaml': catalogInfoYaml,
      },
    });

    const entity = await getObjectToAnnotate(
      workspacePath,
      './custom-entity.yaml',
    );

    expect(entity.metadata.name).toBe('test-component');
  });

  it('throws when the entity file does not exist', async () => {
    mockDir.setContent({
      [workspacePath]: {},
    });

    await expect(
      getObjectToAnnotate(workspacePath, undefined),
    ).rejects.toThrow();
  });
});
