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
import type { DataFetcher } from '@backstage-community/plugin-mdx-card-common';

export type { DataFetcher };

/**
 * Props shared by the MDX card components.
 *
 * @public
 */
export type MdxCardProps = {
  /** MDX template rendered inside the card. Takes precedence over `templateRef`. */
  template?: string;
  /**
   * ID of a template stored by the MDX card backend. Its data fetchers are
   * used too, and `dataFetchers` with the same name replace them.
   */
  templateRef?: string;
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
