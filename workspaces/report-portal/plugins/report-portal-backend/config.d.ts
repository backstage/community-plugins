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
  /**
   * Configuration values for Report Portal plugin
   * @visibility frontend
   */
  reportPortal?: {
    /**
     * A link in form of Email template
     * @example
     * supportEmailTemplate: `mailto://example@company.com?subject=${subject}&body=${body}`
     * // where 'subject' and 'body' must be in url-encoded format
     *
     * @see https://www.mail-signatures.com/articles/mailto-links-emails/
     * @visibility frontend
     */
    supportEmailTemplate?: string;
    /**
     * @visibility frontend
     */
    integrations?: Array<{
      /**
       * Host of report portal url
       * @visibility frontend
       */
      host: string;
      /**
       * Base api url for report portal instance, add trailing '/' in url
       * @visibility backend
       */
      baseUrl: string;
      /**
       * The Api token that will be used to
       * @visibility secret
       */
      token: string;
      /**
       * Filter type to apply for current host
       * @visibility frontend
       */
      filterType: string;
    }>;
  };
}
