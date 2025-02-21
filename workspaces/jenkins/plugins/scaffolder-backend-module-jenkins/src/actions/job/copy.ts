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
import Jenkins from 'jenkins';

/**
 * @public
 *
 * This copyJob function, creates a job given a source job name
 *
 * @param jenkins - The client to interact with jenkins instance
 * @returns Empty response, in case of error an exception will be thrown by jenkins client
 */
export function copyJob(jenkins: Jenkins) {
  return createTemplateAction<{
    sourceJobName: string;
    targetJobName: string;
  }>({
    id: 'jenkins:job:copy',
    description: 'Creating a job jenkins given an existing job',
    schema: {
      input: {
        type: 'object',
        required: ['sourceJobName', 'targetJobName'],
        properties: {
          sourceJobName: {
            title: 'Jenkins job name',
            description: 'Name of jenkins item',
            type: 'string',
          },
          targetJobName: {
            title: 'Jenkins job name',
            description: 'Name of jenkins item',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Copying jenkins job ${ctx.input.sourceJobName} to ${ctx.input.targetJobName} to `,
      );

      await jenkins.job.copy(ctx.input.targetJobName, ctx.input.sourceJobName);
      ctx.logger.info('Job copied successfully!');
    },
  });
}
