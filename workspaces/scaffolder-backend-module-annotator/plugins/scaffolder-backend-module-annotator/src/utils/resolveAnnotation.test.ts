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
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import { resolveAnnotation } from './resolveAnnotation';

describe('resolveAnnotation', () => {
  it('returns an empty object when annotation is undefined', () => {
    const ctx = createMockActionContext({ workspacePath: '/tmp' });

    expect(resolveAnnotation(undefined, ctx)).toEqual({});
  });

  it('returns an empty object when annotation is empty', () => {
    const ctx = createMockActionContext({ workspacePath: '/tmp' });

    expect(resolveAnnotation({}, ctx)).toEqual({});
  });

  it('passes through string annotation values unchanged', () => {
    const ctx = createMockActionContext({ workspacePath: '/tmp' });

    expect(
      resolveAnnotation({ 'backstage.io/template-version': '1.2.3' }, ctx),
    ).toEqual({
      'backstage.io/template-version': '1.2.3',
    });
  });

  it('resolves readFromContext values using backstage.io/template-version from the context path', () => {
    const ctx = createMockActionContext({
      workspacePath: '/tmp',
      templateInfo: {
        entityRef: 'template:default/test',
        entity: {
          metadata: {
            name: 'test',
            annotations: {
              'backstage.io/template-version': '0.0.1',
            },
          },
        },
      },
    });

    expect(
      resolveAnnotation(
        {
          'backstage.io/template-version': {
            readFromContext: 'templateInfo.entity.metadata.annotations',
          },
        },
        ctx,
      ),
    ).toEqual({
      'backstage.io/template-version': '0.0.1',
    });
  });
});
