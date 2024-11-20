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
 * Annotations to enable or configure the Tekton plugin.
 *
 * @public
 */
export enum TektonAnnotations {
  /**
   * Enables the CI/CD feature for catalog entities.
   *
   * Key is `tekton.dev/cicd`, value should be set to `"true"`.
   *
   * Quoates are required because catalog entity annotation-values must be a string.
   */
  CICD = 'tekton.dev/cicd',
}
