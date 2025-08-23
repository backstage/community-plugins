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
import { CreateActionOptions, ServiceNowResponses } from '../../../types';
import { updateOpenAPIConfig } from './helpers';

import { examples } from './update-record.example';

const id = 'servicenow:now:table:updateRecord';

/**
 * Creates an action handler that updates a record in the specified table.
 * @public
 * @param options - options to configure the action
 * @returns TemplateAction - an action handler
 */
export const updateRecordAction = (options: CreateActionOptions) => {
  const { config } = options;

  return createTemplateAction({
    id,
    examples,
    description:
      'Updates the specified record with the name-value pairs included in the request body',
    schema: {
      input: {
        tableName: z =>
          z
            .string()
            .min(1)
            .describe('Name of the table in which to update the record'),
        sysId: z =>
          z
            .string()
            .min(1)
            .describe('Unique identifier of the record to update'),
        requestBody: z =>
          z
            .custom<Record<PropertyKey, unknown>>()
            .optional()
            .describe(
              'Field name and the associated value for each parameter to define in the specified record',
            ),
        sysparmDisplayValue: z =>
          z
            .enum(['true', 'false', 'all'])
            .optional()
            .describe(
              'Return field display values (true), actual values (false), or both (all) (default: false)',
            ),
        sysparmExcludeReferenceLink: z =>
          z
            .boolean()
            .optional()
            .describe(
              'True to exclude Table API links for reference fields (default: false)',
            ),
        sysparmFields: z =>
          z
            .array(z.string().min(1))
            .optional()
            .describe('An array of fields to return in the response'),
        sysparmInputDisplayValue: z =>
          z
            .boolean()
            .optional()
            .describe(
              'Set field values using their display value (true) or actual value (false) (default: false)',
            ),
        sysparmSuppressAutoSysField: z =>
          z
            .boolean()
            .optional()
            .describe(
              'True to suppress auto generation of system fields (default: false)',
            ),
        sysparmView: z =>
          z
            .string()
            .optional()
            .describe(
              'Render the response according to the specified UI view (overridden by sysparm_fields)',
            ),
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

      let res: ServiceNowResponses['200'];
      try {
        res = (await DefaultService.patchApiNowTableByTableNameBySysId({
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
