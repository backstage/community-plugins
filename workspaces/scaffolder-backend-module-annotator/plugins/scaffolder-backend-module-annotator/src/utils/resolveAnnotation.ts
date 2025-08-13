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
import type { ActionContext } from '@backstage/plugin-scaffolder-node';

import { get } from 'lodash';
import { Value } from '../types';

export const resolveAnnotation = (
  annotation: { [key: string]: Value } | undefined,
  ctx: ActionContext<any>,
) => {
  if (!annotation || Object.keys(annotation).length === 0) {
    return {};
  }
  return Object.keys(annotation).reduce((acc, s) => {
    const val = annotation[s];
    return {
      ...acc,
      ...{
        [`${s}`]:
          typeof val === 'string'
            ? annotation[s]
            : get(ctx, val.readFromContext)!['backstage.io/template-version'],
      },
    };
  }, {});
};
