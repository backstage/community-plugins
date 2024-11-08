/*
 * Copyright 2022 The Backstage Authors
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

export interface Config {
  app: {
    // TODO: Only marked as optional because backstage-cli config:check in the
    // context of the monorepo is too strict. Ideally, this would be marked as
    // required.
    analytics?: {
      segment:
        | {
            /**
             * The Segment write key.
             * @visibility frontend
             */
            writeKey?: string;

            /**
             * Prevents events from actually being sent when set to true. Defaults
             * to false.
             * @visibility frontend
             */
            testMode: true;

            /**
             * Prevents IP address to be sent as when set to true. Defaults to false
             * @visibility frontend
             */
            maskIP?: boolean;
          }
        | {
            /**
             * The Segment write key.
             * @visibility frontend
             */
            writeKey: string;

            /**
             * Prevents events from actually being sent when set to true. Defaults
             * to false.
             * @visibility frontend
             */
            testMode?: false;

            /**
             * Prevents IP address to be sent as when set to true. Defaults to false
             * @visibility frontend
             */
            maskIP?: boolean;
          };
    };
  };
}
