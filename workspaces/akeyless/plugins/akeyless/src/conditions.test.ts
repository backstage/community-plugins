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

import { ComponentEntity } from '@backstage/catalog-model';
import { isAkeylessAvailable } from './conditions';
import { AKEYLESS_SECRET_PATH_ANNOTATION } from './constants';

describe('isAkeylessAvailable', () => {
  const entity = (annotations: Record<string, string>) =>
    ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'test', annotations },
      spec: { type: 'service', lifecycle: 'production', owner: 'team' },
    } as ComponentEntity);

  it('returns true when a non-empty path is annotated', () => {
    expect(
      isAkeylessAvailable(
        entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo/prod' }),
      ),
    ).toBe(true);
  });

  it('returns false when the annotation is missing', () => {
    expect(isAkeylessAvailable(entity({}))).toBe(false);
  });

  it('returns false for whitespace-only annotations', () => {
    expect(
      isAkeylessAvailable(entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: '   ' })),
    ).toBe(false);
  });

  it('returns false when the annotation contains only separators', () => {
    expect(
      isAkeylessAvailable(
        entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: ' , , ' }),
      ),
    ).toBe(false);
  });
});
