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
 * This enableJob function, enables a job given a job name
 *
 * @param jenkins - The client to interact with jenkins instance
 * @returns Empty response, in case of error an exception will be thrown by jenkins client
 */
export function enableJob(jenkins: Jenkins) {
  return createTemplateAction({
    id: 'jenkins:job:enable',
    description: 'Destroy an existing job jenkins given a name',
    schema: {
      input: {
        jobName: z => z.string({ description: 'Name of jenkins item' }),
      },
    },
    async handler(ctx) {
      ctx.logger.info(`Enabling jenkins job ${ctx.input.jobName}`);

      await jenkins.job.enable(ctx.input.jobName);
      ctx.logger.info('Job enabled successfully!');
    },
  });
}
