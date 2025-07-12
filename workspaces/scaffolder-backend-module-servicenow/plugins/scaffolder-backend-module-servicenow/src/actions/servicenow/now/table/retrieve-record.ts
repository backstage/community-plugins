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
import {
  createTemplateAction,
  type TemplateAction,
} from '@backstage/plugin-scaffolder-node';

import { z } from 'zod';

import {
  ApiError,
  DefaultService,
  OpenAPI,
} from '../../../../generated/now/table';
import { CreateActionOptions, ServiceNowResponses } from '../../../types';
import { updateOpenAPIConfig } from './helpers';

import { examples } from './retrieve-record.example';

/**
 * Schema for the input to the `retrieveRecord` action.
 *
 * @see {@link https://developer.servicenow.com/dev.do#!/reference/api/vancouver/rest/c_TableAPI}
 */
const schemaInput = z.object({
  tableName: z
    .string()
    .min(1)
    .describe('Name of the table from which to retrieve the record'),
  sysId: z
    .string()
    .min(1)
    .describe('Unique identifier of the record to retrieve'),
  sysparmDisplayValue: z
    .enum(['true', 'false', 'all'])
    .optional()
    .describe(
      'Return field display values (true), actual values (false), or both (all) (default: false)',
    ),
  sysparmExcludeReferenceLink: z
    .boolean()
    .optional()
    .describe(
      'True to exclude Table API links for reference fields (default: false)',
    ),
  sysparmFields: z
    .array(z.string().min(1))
    .optional()
    .describe('An array of fields to return in the response'),
  sysparmView: z
    .string()
    .optional()
    .describe(
      'Render the response according to the specified UI view (overridden by sysparm_fields)',
    ),
  sysparmQueryNoDomain: z
    .boolean()
    .optional()
    .describe(
      'True to access data across domains if authorized (default: false)',
    ),
});

const id = 'servicenow:now:table:retrieveRecord';

/**
 * Creates an action handler that retrieves the record identified by the specified sys_id from the specified table.
 * @public
 * @param options - options to configure the action
 * @returns TemplateAction - an action handler
 */
export const retrieveRecordAction = (
  options: CreateActionOptions,
): TemplateAction => {
  const { config } = options;

  return createTemplateAction({
    id,
    examples,
    description:
      'Retrieves the record identified by the specified sys_id from the specified table',
    schema: {
      input: schemaInput,
    },

    async handler(ctx) {
      // FIXME: remove the type assertion once backstage properly infers the type
      const input = ctx.input as z.infer<typeof schemaInput>;

      updateOpenAPIConfig(OpenAPI, config);

      let res: ServiceNowResponses['200'];
      try {
        res = (await DefaultService.getApiNowTableByTableNameBySysId({
          ...input,
          sysparmFields: input.sysparmFields?.join(','),
        })) as ServiceNowResponses['200'];
      } catch (error) {
        const e = error as ApiError & {
          body?: { error?: { message?: string } };
        };

        throw new Error(e.body?.error?.message);
      }

      ctx.output('result', res?.result);
    },
  });
};
