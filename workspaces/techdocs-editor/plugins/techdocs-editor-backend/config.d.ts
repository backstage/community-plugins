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
   * Optional configuration for the TechDocs editor backend plugin.
   */
  techdocsEditor?: {
    /**
     * Default author name for commits created by the editor.
     * Defaults to the logged-in user's Backstage login name.
     */
    defaultAuthorName?: string;

    /**
     * Default author email for commits created by the editor.
     * Defaults to 'techdocs-editor@backstage.io'.
     */
    defaultAuthorEmail?: string;

    /**
     * Maximum JSON request body size for `/submissions` payloads (e.g. '10mb').
     */
    requestBodyLimit?: string;
  };
}
