import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { InputError } from '@backstage/errors';
import fetch from 'cross-fetch';
import fs from 'fs';
import { resolveSafeChildPath } from '@backstage/backend-common';

interface JenkinsCreateJobActionOptions {
  config: {
    getOptionalString: (key: string) => string | undefined;
  };
}

const jenkinsCreateJobAction = (options: JenkinsCreateJobActionOptions) => {
  const { config } = options;
  return createTemplateAction<{
    configPath: string;
    jobName: string;
    folderName: string;
    serverUrl: string | undefined;
  }>({
    id: "jenkins:job:create",
    description: "Create a new job in Jenkins",
    schema: {
      input: {
        required: ["configPath", "jobName"],
        type: "object",
        properties: {
          configPath: {
            type: "string",
            title: "Config Path"
          },
          jobName: {
            type: "string",
            title: "Job Name"
          },
          folderName: {
            type: "string",
            title: "Folder"
          },
          serverUrl: {
            type: "string",
            title: "URL"
          }
        }
      }
    },
    async handler(ctx) {
      const { configPath, jobName, folderName, serverUrl } = ctx.input;
      const outputDir: string = resolveSafeChildPath(ctx.workspacePath, configPath);
      const username: string | undefined = config.getOptionalString("scaffolder.jenkins.username");
      const apiKey: string | undefined = config.getOptionalString("scaffolder.jenkins.key");
      const server: string | undefined = serverUrl as string || config.getOptionalString("scaffolder.jenkins.server");
      if (!username || !apiKey) {
        throw new InputError(
          `No valid Jenkins credentials given. Please add them to the config file.`
        );
      }
      if (!server) {
        throw new InputError(
          `No valid Jenkins server given. Please add it to the config file.`
        );
      }
      const token: string = Buffer.from(`${username}:${apiKey}`).toString("base64");
      let url: string = `${server}`;
      if (folderName) {
        url = url.concat(`/job/${folderName}`);
      }
      url = url.concat(`/createItem?name=${jobName}`);
      let readStream: string = fs.readFileSync(outputDir, "utf8");
      const response: Response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/xml"
        },
        body: readStream
      });
      if (response.ok) {
        ctx.logger.info(`Successfully created job ${jobName}`);
        ctx.logger.info(
          `Job URL: ${server}${folderName ? `/job/${folderName}` : ""}/job/${jobName}`
        );
      }
      if (!response.ok) {
        throw new Error(
          `Failed to create job, ${response.status} ${response.statusText}`
        );
      }
    }
  });
};

export { jenkinsCreateJobAction };