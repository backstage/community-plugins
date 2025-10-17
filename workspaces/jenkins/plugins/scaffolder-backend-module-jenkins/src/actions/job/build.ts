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
import { z } from 'zod';

/**
 * Create a scaffolder action to trigger a Jenkins job.
 */
export function buildJob(jenkins: Jenkins) {
  return createTemplateAction({
    id: 'jenkins:job:build',
    description: 'Run an existing Jenkins job given its name',
    schema: {
      input: z.object({
        jobName: z.string().describe('Name of the Jenkins job to run'),
        jobParameters: z.record(z.any()).optional(),
      }),
    },
    async handler(ctx) {
      ctx.logger.info(`Starting Jenkins job: ${ctx.input.jobName}`);

      await jenkins.job.build(ctx.input.jobName, ctx.input.jobParameters);

      ctx.logger.info('Job started successfully!');
    },
  });
}
