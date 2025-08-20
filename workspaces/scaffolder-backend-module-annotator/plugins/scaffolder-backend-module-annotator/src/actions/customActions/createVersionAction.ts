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
import { createAnnotatorAction } from '../annotator/annotator';
import { examples } from './createVersionAction.examples';

/**
 * @public
 */
export const createVersionAction = () => {
  return createAnnotatorAction(
    'catalog:template:version',
    'Creates a new `catalog:template:version` scaffolder action to update a catalog-info.yaml with the versioning information from the scaffolder template',
    'Annotating catalog-info.yaml with the version of the scaffolder template',
    () => {
      return {
        annotations: {
          'backstage.io/template-version': {
            readFromContext: 'templateInfo.entity.metadata.annotations',
          },
        },
      };
    },
    examples,
  );
};
