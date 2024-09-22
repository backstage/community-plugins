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
import { makeFieldSchemaFromZod } from '@backstage/plugin-scaffolder';
import { z } from 'zod';

export const DevfileSelectorExtensionWithOptionsFieldSchema =
  makeFieldSchemaFromZod(
    z.object({
      devfile: z.string().describe('Devfile name'),
      version: z.string().describe('Devfile Stack version'),
      starterProject: z
        .string()
        .optional()
        .describe('Devfile Stack starter project'),
    }),
  );

export const DevfileSelectorExtensionWithOptionsSchema =
  DevfileSelectorExtensionWithOptionsFieldSchema.schema;
