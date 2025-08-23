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
import { getCurrentTimestamp } from '../../utils/getCurrentTimestamp';
import { createAnnotatorAction } from '../annotator/annotator';
import { examples } from './createTimestampAction.examples';

/**
 * @public
 */
export const createTimestampAction = () => {
  return createAnnotatorAction(
    'catalog:timestamping',
    'Creates a new `catalog:timestamping` Scaffolder action to annotate scaffolded entities with creation timestamp.',
    'Annotating catalog-info.yaml with current timestamp',
    () => {
      return {
        annotations: { 'backstage.io/createdAt': getCurrentTimestamp() },
      };
    },
    examples,
  );
};
