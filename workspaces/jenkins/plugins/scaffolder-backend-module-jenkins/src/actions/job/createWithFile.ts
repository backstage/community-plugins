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
import fs from 'fs/promises';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import Jenkins from 'jenkins';

/**
 * @public
 *
 * This createJobWithFile function, creates a job given a job name and own configuration file as xml format
 *
 * @param jenkins - The client to interact with jenkins instance
 * @returns Empty response, in case of error an exception will be thrown by jenkins client
 */
const createJobWithFile = (jenkins: Jenkins) => {
  return createTemplateAction<{
    configPath: string;
    jobName: string;
    folderName: string;
  }>({
    id: 'jenkins:job:create-file',
    description: 'Create a new job in Jenkins',
    schema: {
      input: {
        required: ['configPath', 'jobName'],
        type: 'object',
        properties: {
          configPath: {
            type: 'string',
            title: 'Config Path',
          },
          jobName: {
            type: 'string',
            title: 'Job Name',
          },
          folderName: {
            type: 'string',
            title: 'Folder',
          },
          serverUrl: {
            type: 'string',
            title: 'URL',
          },
        },
      },
    },
    async handler(ctx) {
      try {
        const { configPath, folderName } = ctx.input;
        const outputDir = resolveSafeChildPath(ctx.workspacePath, configPath);
        const jobXml = await fs.readFile(outputDir, 'utf8');

        ctx.logger.info(
          `Creating jenkins job ${ctx.input.jobName} under folder ${ctx.input.folderName}`,
        );

        ctx.logger.debug(
          'Trying to create job jenkins with this xml {}',
          jobXml,
        );

        let jobName;
        if (folderName) {
          jobName = `${folderName}/${ctx.input.jobName}`;
        } else {
          jobName = ctx.input.jobName;
        }

        await jenkins.job.create(jobName, jobXml);

        ctx.logger.info('Job created successfully!');
      } catch (err) {
        ctx.logger.error('Error creating job please check', err);
        throw err;
      }
    },
  });
};

export { createJobWithFile };
