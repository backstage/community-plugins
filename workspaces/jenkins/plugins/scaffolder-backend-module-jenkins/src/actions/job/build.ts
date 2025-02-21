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
 *
 * This buildJob function, creates a template action for running a Jenkins job
 *
 * @param jenkins - The client to interact with jenkins instance
 * @returns Empty response, in case of error an exception will be thrown by jenkins client
 */
export function buildJob(jenkins: Jenkins) {
  return createTemplateAction<{
    jobName: string;
    jobParameters: any;
  }>({
    id: 'jenkins:job:build',
    description: 'Run an existing job jenkins given a name',
    schema: {
      input: {
        type: 'object',
        required: ['jobName'],
        properties: {
          jobName: {
            title: 'Jenkins job name',
            description: 'Name of jenkins item',
            type: 'string',
          },
          jobParameters: {
            title: 'Jenkins job parameters',
            description: 'Parameters passed to job jenkins',
            type: 'any',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(`Starting jenkins job ${ctx.input.jobName}`);

      try {
        await jenkins.job.build(ctx.input.jobName, ctx.input.jobParameters);
        ctx.logger.info('Job started successfully!');
      } catch (err) {
        ctx.logger.error('Error creating job please check', err);
        throw err;
      }
    },
  });
}
