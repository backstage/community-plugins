/*
 * Copyright 2025 The Backstage Authors
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
   * Configuration for the Bookmarks plugin
   *
   * @visibility frontend
   */
  bookmarks?: {
    /**
     * Configuration for custom protocols, which can be used to embed
     * or link to URLs with non-standard protocols.
     *
     * @deepVisibility frontend
     */
    customProtocols?: {
      /** The custom protocol to match, e.g. "myapp" for "myapp://some/path" */
      [protocol: string]: {
        /**
         * The base URL to use for iframe src with %s replaced by the encoded original URL,
         * e.g. "https://myapp-iframe-host.com/iframe?url=%s"
         */
        iframeBaseUrl: string;
        /**
         * The base URL to use for anchor href with %s replaced by the encoded original URL,
         * e.g. "https://myapp-web-host.com/open?url=%s"
         */
        linkBaseUrl: string;
      };
    };
  };
}
