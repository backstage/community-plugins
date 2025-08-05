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
  resolveSafeChildPath,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { buildJenkinsClient } from '../../config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fs from 'fs/promises';
import Jenkins from 'jenkins';

/**
 * This createJob function, creates a job given a job name and own configuration file as xml format
 *
 * @param jenkins - The client to interact with jenkins instance
 * @returns Empty response, in case of error an exception will be thrown by jenkins client
 */
export function createJob(jenkins: Jenkins, config: RootConfigService) {
  return createTemplateAction({
    id: 'jenkins:job:create',
    description: 'Create a job jenkins given a name and gitlab repo',
    schema: {
      input: {
        serverUrl: z => z.string({ description: 'URL' }).optional(),
        configPath: z =>
          z.string({ description: 'Path to config file of job' }).optional(),
        jobName: z => z.string({ description: 'Name of jenkins item' }),
        jobXml: z =>
          z
            .string({
              description: 'XML of job used by jenkins to create the job',
            })
            .optional(),
        folderName: z => z.string().optional(),
      },
    },
    async handler(ctx) {
      ctx.logger.info(`Creating jenkins job ${ctx.input.jobName}`);

      const { configPath, folderName, serverUrl } = ctx.input;

      let jobXml = ctx.input.jobXml;
      if (configPath) {
        jobXml = await fs.readFile(
          resolveSafeChildPath(ctx.workspacePath, configPath),
          'utf8',
        );
      }

      let jobName;
      if (folderName) {
        jobName = `${folderName}/${ctx.input.jobName}`;
      } else {
        jobName = ctx.input.jobName;
      }

      if (!jobXml) {
        throw new Error(
          'JobXml cannot be null or empty, please configure with inline content or from xml file!',
        );
      }

      const client = serverUrl ? buildJenkinsClient(config) : jenkins;
      await client.job.create(jobName, jobXml);
      ctx.logger.info('Job created successfully!');
    },
  });
}
