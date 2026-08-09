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

import { resolveSpec } from './resolveSpec';

describe('resolveSpec', () => {
  it('returns an empty object when spec is undefined', () => {
    const ctx = createMockActionContext({ workspacePath: '/tmp' });

    expect(resolveSpec(undefined, ctx)).toEqual({});
  });

  it('returns an empty object when spec is empty', () => {
    const ctx = createMockActionContext({ workspacePath: '/tmp' });

    expect(resolveSpec({}, ctx)).toEqual({});
  });

  it('passes through string spec values unchanged', () => {
    const ctx = createMockActionContext({ workspacePath: '/tmp' });

    expect(
      resolveSpec({ scaffoldedFrom: 'template:default/example' }, ctx),
    ).toEqual({
      scaffoldedFrom: 'template:default/example',
    });
  });

  it('resolves readFromContext values from the action context', () => {
    const ctx = createMockActionContext({
      workspacePath: '/tmp',
      templateInfo: {
        entityRef: 'template:default/test',
      },
    });

    expect(
      resolveSpec(
        {
          scaffoldedFrom: { readFromContext: 'templateInfo.entityRef' },
        },
        ctx,
      ),
    ).toEqual({
      scaffoldedFrom: 'template:default/test',
    });
  });
});
