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
import type {
  BackstageUserIdentity,
  ProfileInfo,
} from '@backstage/core-plugin-api';
import type { MDXComponents } from 'mdx/types';

/**
 * Describes a backend request whose JSON response is exposed to the template.
 *
 * @public
 */
export type DataFetcher = {
  /** Property name the response is exposed under in the template props. */
  name: string;
  /** Backend plugin ID resolved through the discovery API, e.g. `catalog`. */
  pluginId: string;
  /**
   * Path relative to the plugin base URL. Supports Nunjucks expressions with
   * `entity` and `user` in scope, e.g. `/entities/by-name/{{ entity.kind }}/...`.
   */
  apiUrl: string;
};

/**
 * Props shared by the MDX card components.
 *
 * @public
 */
export type MdxCardProps = {
  /** MDX template rendered inside the card. */
  template: string;
  /** Requests whose responses are passed to the template as props. */
  dataFetchers?: DataFetcher[];
  /** Additional components made available to the template. */
  components?: MDXComponents;
};

/**
 * Information about the signed-in user, exposed to templates as `props.user`.
 *
 * @public
 */
export type UserInformation = {
  profile: ProfileInfo;
  identity: BackstageUserIdentity;
  displayName: string;
};
