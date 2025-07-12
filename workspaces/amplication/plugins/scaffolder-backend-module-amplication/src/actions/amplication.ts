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
import { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
/**
 * Creates an action that creates an application in MTA.
 */

/** @public */
export function scaffoldResourceFromAmplicationTemplate({
  config,
}: {
  config: Config;
}) {
  return createTemplateAction({
    id: 'amplication:scaffold-service',
    description: 'Scaffold a new service from a template (using Amplication)',
    schema: {
      input: {
        name: z => z.string({ description: 'The name of the service' }),
        description: z =>
          z
            .string({ description: 'The description of the service' })
            .optional(),
        project_id: z => z.string({ description: 'The ID of the project' }),
        serviceTemplate_id: z =>
          z.string({ description: 'The ID of the service template' }),
        workspace_id: z =>
          z.string({ description: 'The ID of the workspace' }).optional(),
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Running amplication's service scaffolder for ${ctx.input.name}`,
      );

      const appUrl = config.getString('amplication.appUrl');
      const apiUrl = config.getString('amplication.apiUrl');
      const token = config.getString('amplication.token');
      const httpOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operationName: 'createServiceFromTemplate',
          variables: {
            data: {
              name: ctx.input.name,
              description: ctx.input.description || '',
              project: {
                connect: {
                  id: ctx.input.project_id,
                },
              },
              serviceTemplate: {
                id: ctx.input.serviceTemplate_id,
              },
              buildAfterCreation: true,
            },
          },
          query:
            'mutation createServiceFromTemplate($data: ResourceFromTemplateCreateInput!) {\n  createResourceFromTemplate(data: $data) {\n    id\n    name\n    description\n    __typename\n  }\n}',
        }),
      };

      try {
        const response = await fetch(apiUrl, httpOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const body = await response.json();
        if (body.errors) {
          throw new Error(`Error! ${body.errors[0].message}`);
        }

        ctx.logger.info('Service created successfully');
        ctx.output(
          'url',
          `${appUrl}/${ctx.input.workspace_id}/${ctx.input.project_id}/${body.data.createResourceFromTemplate.id}`,
        );
      } catch (e) {
        throw new Error(`There was an issue with the request: ${e}`);
      }
    },
  });
}
