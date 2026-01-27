/*
 * Copyright 2024 The Backstage Authors
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
import { mockEntity } from '../../../dev/__data__';
import { isArgocdConfigured } from '../isArgocdConfigured';

describe('isArgocdConfigured', () => {
  test('should return false if argocd is not configured', () => {
    expect(
      isArgocdConfigured({
        ...mockEntity,
        metadata: {
          ...mockEntity.metadata,
          annotations: {},
        },
      }),
    ).toBe(false);
  });

  test('should return true if argocd is configured', () => {
    expect(isArgocdConfigured(mockEntity)).toBe(true);
  });
});
