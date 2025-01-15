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
import { LoggerService, UrlReaderService } from '@backstage/backend-plugin-api';
import {
  TechRadarLoaderResponse,
  TechRadarLoaderResponseParser,
} from '@backstage-community/plugin-tech-radar-common';
import { ZodError } from 'zod';

/**
 * Reads data from a URL via the urlReader, then parses it into a TechRadarLoaderResponse.
 * Returns undefined if the data could not be read or parsed safely.
 * @param url - the URL to read from.
 * @param urlReader - a URLReader for reading from integrations.
 * @param LoggerService - a logger for logging errors.
 *
 * @internal
 */
export async function readTechRadarResponseFromURL(
  url: string,
  urlReader: UrlReaderService,
  logger: LoggerService,
): Promise<TechRadarLoaderResponse | undefined> {
  let buffer = undefined;
  let responseJson = undefined;
  try {
    const response = await urlReader.readUrl(url);
    buffer = await response.buffer();
  } catch (e) {
    // Log a warning.
    logger.warn(
      `Failed to read file from ${url} with provided integrations (error is "${e.message}").`,
    );
  }

  if (buffer) {
    try {
      responseJson = JSON.parse(buffer.toString());
      const validationResult =
        TechRadarLoaderResponseParser.safeParse(responseJson);
      if (!validationResult.success) {
        const errorMessage = `Could not parse data from remote URL '${url}' because validation failed: ${aggregateErrorMessages(
          validationResult.error,
        )}. URL must serve JSON that is compatible with the TechRadarLoaderResponse schema.`;
        logger.error(errorMessage);
      } else {
        return validationResult.data;
      }
    } catch (e) {
      logger.error(
        `Failed to parse JSON from remote resource ${url}, data will not be loaded!`,
      );
    }
  }

  return undefined;
}

/**
 * Aggregates error messages from a ZodError.
 * @internal
 * @param zodError
 */
function aggregateErrorMessages(zodError: ZodError): string {
  return zodError.issues.reduce((acc, issue) => {
    if (issue) {
      return [acc, `${issue.message} parameter '${issue.path}'`]
        .filter(Boolean)
        .join('. ');
    }
    return acc;
  }, '');
}
