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
  techInsights?: {
    maturity?: {
      /**
       * When enabled (true), maturity checks run directly against any entity
       * (System, Domain, Group, API, Resource, etc.) so that the entity has
       * its own maturity score. The Maturity Summary page additionally
       * renders the entity's own scorecard alongside the rollup of its
       * related components.
       *
       * When disabled (false, default), the existing behavior is preserved:
       * Component entities are scored individually, while entities that
       * have related components (System, Domain, Group) aggregate the
       * results of those components.
       *
       * @visibility frontend
       */
      enableCompoundEntityCheck?: boolean;
    };
  };
}
