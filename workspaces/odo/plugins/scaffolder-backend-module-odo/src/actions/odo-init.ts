import type { Config } from '@backstage/config';
import {
  createTemplateAction,
  executeShellCommand,
} from '@backstage/plugin-scaffolder-node';
import cachedir from 'cachedir';
import fs from 'fs-extra';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const createOdoInitAction = ({
  odoConfig,
}: {
  odoConfig: Config | undefined;
}) => {
  return createTemplateAction<{
    devfile: string;
    version: string;
    starter_project: string | undefined;
    name: string;
  }>({
    id: 'devfile:odo:component:init',
    schema: {
      input: {
        required: ['devfile', 'version', 'name'],
        type: 'object',
        properties: {
          devfile: {
            type: 'string',
            title: 'Devfile',
            description: 'The Devfile',
          },
          version: {
            type: 'string',
            title: 'Version',
            description: 'The Devfile Stack version',
          },
          starter_project: {
            type: 'string',
            title: 'Starter Project',
            description: 'The starter project',
          },
          name: {
            type: 'string',
            title: 'Component name',
            description: 'The new component name',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(`Workspace: "${ctx.workspacePath}"`);
      ctx.logger.info(
        `Init "${ctx.input.name}" from: devfile=${ctx.input.devfile}, version=${ctx.input.version}, starterProject=${ctx.input.starter_project}...`,
      );

      const telemetryDisabled =
        odoConfig?.getOptionalBoolean('telemetry.disabled') ?? false;
      ctx.logger.info(`...telemetry disabled: ${telemetryDisabled}`);

      // Create a temporary file to use as dedicated config for odo
      const tmpDir = await fs.mkdtemp(join(tmpdir(), 'odo-init-'));
      const odoConfigFilePath = join(tmpDir, 'config');
      ctx.logger.info(`...temp dir for odo config: ${tmpDir}`);

      const envVars = {
        // Due to a limitation in Node's child_process, the command lookup will be performed using options.env.PATH if options.env is defined.
        // See https://nodejs.org/docs/latest-v18.x/api/child_process.html#child_process_child_process
        ...process.env,
        GLOBALODOCONFIG: odoConfigFilePath,
        ODO_TRACKING_CONSENT: telemetryDisabled ? 'no' : 'yes',
        TELEMETRY_CALLER: 'backstage',
      };

      const randomRegistryName = 'GeneratedRegistryName';
      const devfileRegistryUrl =
        odoConfig?.getOptionalString('devfileRegistry.url') ??
        'https://registry.devfile.io';

      ctx.logger.info(`...devfile registry URL: ${devfileRegistryUrl}`);

      await fs.createFile(odoConfigFilePath);

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

      // Add registry
      await executeShellCommand({
        command: odoBinaryPath,
        args: [
          'preference',
          'add',
          'registry',
          randomRegistryName,
          devfileRegistryUrl,
        ],
        logStream: ctx.logStream,
        options: {
          cwd: ctx.workspacePath,
          env: envVars,
        },
      });

      // odo init
      const initArgs = [
        'init',
        '--name',
        ctx.input.name,
        '--devfile-registry',
        randomRegistryName,
        '--devfile',
        ctx.input.devfile,
        '--devfile-version',
        ctx.input.version,
      ];
      if (ctx.input.starter_project) {
        initArgs.push('--starter', ctx.input.starter_project);
      }
      await executeShellCommand({
        command: odoBinaryPath,
        args: initArgs,
        logStream: ctx.logStream,
        options: {
          cwd: ctx.workspacePath,
          env: envVars,
        },
      });

      fs.rm(tmpDir, { recursive: true, maxRetries: 2, force: true }, () => {});

      ctx.logger.info(
        `...Finished creating "${ctx.input.name}" from: devfile=${ctx.input.devfile}, version=${ctx.input.version}, starterProject=${ctx.input.starter_project}`,
      );
    },
  });
};
