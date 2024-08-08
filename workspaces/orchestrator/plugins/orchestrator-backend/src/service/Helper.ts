import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import fs from 'fs-extra';

import os from 'os';

export async function retryAsyncFunction<T>(args: {
  asyncFn: () => Promise<T | undefined>;
  maxAttempts: number;
  delayMs: number;
}): Promise<T> {
  let result: T | undefined;
  for (let i = 0; i < args.maxAttempts; i++) {
    result = await args.asyncFn();
    if (result !== undefined) {
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, args.delayMs));
  }
  throw new Error('Exceeded maximum number of retries for async function');
}

export async function getWorkingDirectory(
  config: Config,
  logger: LoggerService,
): Promise<string> {
  if (!config.has('backend.workingDirectory')) {
    return os.tmpdir();
  }

  const workingDirectory = config.getString('backend.workingDirectory');
  try {
    // Check if working directory exists and is writable
    await fs.access(workingDirectory, fs.constants.F_OK | fs.constants.W_OK);
    logger.info(`using working directory: ${workingDirectory}`);
  } catch (err: any) {
    logger.error(
      `working directory ${workingDirectory} ${
        err.code === 'ENOENT' ? 'does not exist' : 'is not writable'
      }`,
    );
    throw err;
  }
  return workingDirectory;
}

export async function executeWithRetry(
  action: () => Promise<Response>,
  maxErrors = 15,
): Promise<Response> {
  let response: Response;
  let errorCount = 0;
  // execute with retry
  const backoff = 5000;
  while (errorCount < maxErrors) {
    try {
      response = await action();
      if (response.status >= 400) {
        errorCount++;
        // backoff
        await delay(backoff);
      } else {
        return response;
      }
    } catch (e) {
      errorCount++;
      await delay(backoff);
    }
  }
  throw new Error('Unable to execute query.');
}

export function delay(time: number) {
  return new Promise(r => setTimeout(r, time));
}
