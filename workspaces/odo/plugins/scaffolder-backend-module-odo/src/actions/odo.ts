import type { Config } from '@backstage/config';
import {
  createTemplateAction,
  executeShellCommand,
} from '@backstage/plugin-scaffolder-node';
import cachedir from 'cachedir';
import fs from 'fs-extra';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** @public */
export const createOdoAction = ({
  odoConfig,
}: {
  odoConfig: Config | undefined;
}) => {
  return createTemplateAction<{
    workingDirectory: string;
    command: string;
    args: string[];
  }>({
    id: 'devfile:odo:command',
    schema: {
      input: {
        required: ['command'],
        type: 'object',
        properties: {
          command: {
            type: 'string',
            title: 'Command',
            description: 'The odo command to run from the scaffolder workspace',
          },
          args: {
            type: 'array',
            items: {
              type: 'string',
            },
            title: 'Arguments',
            description: 'Arguments to pass to the command',
          },
        },
      },
    },
    async handler(ctx: any) {
      let args = [ctx.input.command];
      if (ctx.input.args?.length) {
        args = [...args, ...ctx.input.args];
      }

      ctx.logger.info(`Workspace: "${ctx.workspacePath}"`);
      ctx.logger.info(`Running ${args}...`);

      const telemetryDisabled =
        odoConfig?.getOptionalBoolean('telemetry.disabled') ?? false;
      ctx.logger.info(`...telemetry disabled: ${telemetryDisabled}`);

      // Create a temporary file to use as dedicated config for odo
      const tmpDir = await fs.mkdtemp(join(tmpdir(), 'odo-'));
      const odoConfigFilePath = join(tmpDir, 'config');

      const envVars = {
        // Due to a limitation in Node's child_process, the command lookup will be performed using options.env.PATH if options.env is defined.
        // See https://nodejs.org/docs/latest-v18.x/api/child_process.html#child_process_child_process
        ...process.env,
        GLOBALODOCONFIG: odoConfigFilePath,
        ODO_TRACKING_CONSENT: telemetryDisabled ? 'no' : 'yes',
        TELEMETRY_CALLER: 'backstage',
      };

      let odoBinaryPath = odoConfig?.getOptionalString('binaryPath');
      if (!odoBinaryPath) {
        // Resolve from the downloaded dir
        odoBinaryPath = join(
          cachedir('odo'),
          `odo${process.platform === 'win32' ? '.exe' : ''}`,
        );
        if (!fs.existsSync(odoBinaryPath)) {
          // Fallback to any odo command available in the PATH
          ctx.logger.info(
            `odo binary path not set in app-config.yaml and not found in auto-download path (${odoBinaryPath}) => falling back to "odo" in the system PATH`,
          );
          odoBinaryPath = 'odo';
        }
      }
      ctx.logger.info(`odo binary path: ${odoBinaryPath}`);

      await fs.createFile(odoConfigFilePath);
      await executeShellCommand({
        command: odoBinaryPath,
        args: args,
        logStream: ctx.logStream,
        options: {
          cwd: ctx.workspacePath,
          env: envVars,
        },
      });
      fs.rm(tmpDir, { recursive: true, maxRetries: 2, force: true }, () => {});

      ctx.logger.info(`Finished executing odo ${ctx.input.command}`);
    },
  });
};
