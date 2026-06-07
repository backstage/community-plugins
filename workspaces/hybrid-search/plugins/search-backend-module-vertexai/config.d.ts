/*
 * Copyright 2026 The Backstage Authors
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
  techdocs?: {
    publisher?: {
      googleGcs?: {
        bucketName?: string;
      };
    };
  };
  search?: {
    engines?: {
      vertexai?: {
        projectId: string;
        location: string;
        dataStoreId: string;
        engineId?: string;
        /**
         * Additional raw options passed directly to the Discovery Engine search client call.
         */
        searchOptions?: Record<string, any>;
        cleanup?: {
          /**
           * Enable or disable techdocs index and GCS bucket orphan sweeping background task.
           */
          enabled?: boolean;
          /**
           * Frequency for the cleanup sweeper task.
           */
          frequency?: {
            hours?: number;
            minutes?: number;
            seconds?: number;
          };
        };
      };
    };
  };
}
