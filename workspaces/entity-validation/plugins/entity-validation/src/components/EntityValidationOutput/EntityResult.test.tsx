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
import { renderInTestApp } from '@backstage/test-utils';
import { List } from '@backstage/ui';
import { screen } from '@testing-library/react';
import { EntityResult } from './EntityResult';

describe('EntityResult', () => {
  it('shows validation errors for an entity without metadata', async () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
    } as unknown as Entity;

    await renderInTestApp(
      <List aria-label="validation results">
        <EntityResult
          id="result-0"
          isFirstError
          item={{
            type: 'valid',
            entity,
            response: {
              valid: false,
              errors: [
                {
                  name: 'InputError',
                  message: 'metadata is required',
                },
              ],
            },
          }}
        />
      </List>,
    );

    expect(await screen.findByText('metadata is required')).toBeInTheDocument();
  });
});
