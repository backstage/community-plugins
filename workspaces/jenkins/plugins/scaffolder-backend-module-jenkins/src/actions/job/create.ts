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
import { InputError } from '@backstage/errors';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fs from 'fs/promises';
import Jenkins from 'jenkins';

async function createJobByServerUrl(
  config: RootConfigService,
  ctx: any,
  jobXml: string,
) {
  const { folderName, jobName, serverUrl } = ctx.input;
  const username = config.getOptionalString('jenkins.username');
  const apiKey = config.getOptionalString('jenkins.apiKey');
  const server = serverUrl || config.getOptionalString('jenkins.baseUrl');
  if (!username || !apiKey) {
    throw new InputError(
      `No valid Jenkins credentials given. Please add them to the config file.`,
    );
  }
  if (!server) {
    throw new InputError(
      `No valid Jenkins server given. Please add it to the config file.`,
    );
  }
  const token = Buffer.from(`${username}:${apiKey}`).toString('base64');
  let url = `${server}`;
  if (folderName) {
    url = url.concat(`/job/${folderName}`);
  }
  url = url.concat(`/createItem?name=${jobName}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/xml',
    },
    body: jobXml,
  });
  if (response.ok) {
    ctx.logger.info(`Successfully created job ${jobName}`);
    ctx.logger.info(
      `Job URL: ${server}${
        folderName ? `/job/${folderName}` : ''
      }/job/${jobName}`,
    );
  }
  if (!response.ok) {
    throw new Error(
      `Failed to create job, ${response.status} ${response.statusText}`,
    );
  }
}

/**
 * @public
 *
 * This createJob function, creates a job given a job name and own configuration file as xml format
 *
 * @param jenkins - The client to interact with jenkins instance
 * @returns Empty response, in case of error an exception will be thrown by jenkins client
 */
export function createJob(jenkins: Jenkins, config: RootConfigService) {
  return createTemplateAction<{
    jobName: string;
    jobXml: string;
    folderName: string;
    configPath: string;
    serverUrl: string;
  }>({
    id: 'jenkins:job:create',
    description: 'Create a job jenkins given a name and gitlab repo',
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
          jobXml: {
            title: 'Jenkins job xml',
            description: 'XML of job used by jenkins to create the job',
            type: 'string',
          },
          folderName: {
            type: 'string',
            title: 'Folder of jobName',
          },
          configPath: {
            type: 'string',
            title: 'Path to config file of job',
          },
          serverUrl: {
            type: 'string',
            title: 'URL',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(`Creating jenkins job ${ctx.input.jobName}`);

      ctx.logger.debug(
        'Trying to create job jenkins with this xml {}',
        ctx.input.jobXml,
      );
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

      if (serverUrl) {
        await createJobByServerUrl(config, ctx, jobXml);
        return;
      }

      await jenkins.job.create(jobName, jobXml);
      ctx.logger.info('Job created successfully!');
    },
  });
}
