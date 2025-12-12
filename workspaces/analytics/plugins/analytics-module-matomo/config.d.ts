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
export interface Config {
  app?: {
    analytics: {
      matomo: {
        /**
         * Matomo host URL
         * @visibility frontend
         */
        host: string;

        /**
         * Matomo siteId for the Backstage Website
         * @visibility frontend
         */
        siteId: string;

        /**
         * Controls how the identityApi is used when sending data to Matomo:
         *
         * @visibility frontend
         */
        identity?: 'disabled' | 'optional' | 'required';

        /**
         * Sends the identity as plain userId instead of hashing it
         *
         * @visibility frontend
         */
        sendPlainUserId?: boolean;

        /**
         * Enables extended tracking capabilities (navigate events, buffering,…)
         *
         * @visibility frontend
         */
        enhancedTracking?: boolean;

        /**
         * Defers the initial page view until identity is available
         *
         * @visibility frontend
         */
        deferInitialPageView?: boolean;
      };
    };
  };
}
