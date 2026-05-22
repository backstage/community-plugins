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

/**
 * Thrown when the SonarCloud API returns a non-2xx, non-429 response.
 * @public
 */
export class SonarCloudApiError extends Error {
  /** @public */
  public readonly name = 'SonarCloudApiError';

  constructor(
    /** HTTP status code returned by SonarCloud. */
    public readonly status: number,
    /** Error messages extracted from the response body. */
    public readonly messages: string[],
  ) {
    super(`SonarCloud API error ${status}: ${messages.join('; ')}`);
  }
}

/**
 * Thrown when all retry attempts for a 429 response are exhausted.
 * @public
 */
export class SonarCloudRateLimitError extends Error {
  /** @public */
  public readonly name = 'SonarCloudRateLimitError';

  constructor(
    /** Total number of attempts made before giving up. */
    public readonly attempts: number,
  ) {
    super(`SonarCloud rate limit exceeded after ${attempts} attempts`);
  }
}

/**
 * Thrown when a SonarCloud request exceeds the 30-second timeout.
 * @public
 */
export class SonarCloudTimeoutError extends Error {
  /** @public */
  public readonly name = 'SonarCloudTimeoutError';

  constructor(
    /** The API endpoint path that timed out. */
    public readonly endpoint: string,
  ) {
    super(`SonarCloud request to ${endpoint} timed out after 30s`);
  }
}
