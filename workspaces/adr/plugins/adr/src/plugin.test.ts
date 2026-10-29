/*
 * Copyright 2022 The Backstage Authors
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
import {
  adrPlugin,
  EntityAdrContent,
  isAdrAvailable,
  ANNOTATION_ADR_LOCATION,
  ANNOTATION_ASSESSMENT_LOCATION,
} from './index';

describe('adr', () => {
  it('should export plugin and EntityAdrContent', () => {
    expect(adrPlugin).toBeDefined();
    expect(EntityAdrContent).toBeDefined();
  });

  it('should recognize both ADR and assessment annotations in isAdrAvailable', () => {
    expect(
      isAdrAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            [ANNOTATION_ADR_LOCATION]:
              'https://github.com/org/repo/tree/main/docs/adrs',
          },
        },
      }),
    ).toBe(true);

    expect(
      isAdrAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            [ANNOTATION_ASSESSMENT_LOCATION]:
              'https://github.com/org/repo/tree/main/docs/assessments',
          },
        },
      }),
    ).toBe(true);

    expect(
      isAdrAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      }),
    ).toBe(false);
  });
});
