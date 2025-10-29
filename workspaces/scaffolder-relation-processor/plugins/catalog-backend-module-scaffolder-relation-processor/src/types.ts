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

/**
 * Extension of the `spec` field of the entity model
 * Used to form relations between entities and the scaffolder templates that generated them
 *
 * @public
 */
export type ScaffoldedFromSpec = {
  spec: {
    scaffoldedFrom: string;
  };
};

/**
 * Configuration interface for scaffolder relation processor notifications
 *
 * @public
 */
export interface ScaffolderRelationProcessorConfig {
  notifications?: {
    templateUpdate?: {
      enabled: boolean;
      message: {
        title: string;
        description: string;
      };
    };
  };
}
