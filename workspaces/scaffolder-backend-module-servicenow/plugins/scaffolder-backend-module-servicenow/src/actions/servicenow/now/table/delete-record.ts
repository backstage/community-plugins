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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import {
  ApiError,
  DefaultService,
  OpenAPI,
} from '../../../../generated/now/table';
import { CreateActionOptions } from '../../../types';
import { updateOpenAPIConfig } from './helpers';

import { examples } from './delete-record.example';

const id = 'servicenow:now:table:deleteRecord';

/**
 * Creates an action handler that deletes the specified record from the specified table.
 * @public
 * @param options - options to configure the action
 * @returns TemplateAction - an action handler
 */
export const deleteRecordAction = (options: CreateActionOptions) => {
  const { config } = options;

  return createTemplateAction({
    id,
    examples,
    description: 'Deletes the specified record from the specified table',
    schema: {
      input: {
        tableName: z =>
          z
            .string()
            .min(1)
            .describe('Name of the table in which to delete the record'),
        sysId: z =>
          z
            .string()
            .min(1)
            .describe('Unique identifier of the record to delete'),
        sysparmQueryNoDomain: z =>
          z
            .boolean()
            .optional()
            .describe(
              'True to access data across domains if authorized (default: false)',
            ),
      },
    },

    async handler(ctx) {
      const input = ctx.input;

      updateOpenAPIConfig(OpenAPI, config);

      try {
        await DefaultService.deleteApiNowTableByTableNameBySysId(input);
      } catch (error) {
        const e = error as ApiError & {
          body?: { error?: { message?: string } };
        };

        throw new Error(e.body?.error?.message);
      }
    },
  });
};
