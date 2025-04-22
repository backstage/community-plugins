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
import {
  createTemplateAction,
  executeShellCommand,
} from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';

export const createdotnetNewAction = () => {
  return createTemplateAction({
    id: 'dotnet:new',
    description: 'Runs a dotnet new command',
    schema: {
      input: {
        template: z => z.string().describe('Template name'),
        args: z =>
          z
            .array(z.any())
            .describe('Arguments to pass to the command')
            .optional(),
        targetPath: z =>
          z
            .string()
            .describe(
              'Target path within the working directory to generate contents to. Defaults to the working directory root.',
            )
            .optional(),
      },
    },
    async handler(ctx) {
      const { template, args, targetPath } = ctx.input;

      const outputDir = resolveSafeChildPath(
        ctx.workspacePath,
        targetPath ?? './',
      );

      ctx.logger.info(
        `Running dotnet new ${template} script with dotnet:new scaffolder action, workspace path: ${outputDir}`,
      );

      await executeShellCommand({
        command: 'dotnet',
        args: ['new', template, ...(args ?? []).map(x => stringify(x))],
        options: {
          cwd: outputDir,
        },
        logger: ctx.logger,
      });

      ctx.logger.info(`Template written to ${outputDir}`);
    },
  });
};

function stringify(value: any) {
  switch (typeof value) {
    case 'string':
      return value;
    case 'object':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}
