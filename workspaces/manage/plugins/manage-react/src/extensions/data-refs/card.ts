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

import { createExtensionDataRef } from '@backstage/frontend-plugin-api';

import { CardWidgetOptions } from '../types';

/** @public */
export type ManageCardLoaderResult = {
  /** Card title (optional) */
  title?: string;
  /** Card subtitle (optional) */
  subtitle?: string;
  /**
   * Card action (optional).
   *
   * This can be a React node, such as a dropdown button.
   */
  action?: React.ReactNode;
  /** Card content */
  content: React.ReactNode;
};

/** @public */
export type ManageCardLoader = (
  options: CardWidgetOptions,
) => Promise<ManageCardLoaderResult>;

/** @public */
export type ManageCardRef =
  | {
      element: JSX.Element;
    }
  | {
      card: ManageCardLoader;
    };

/** @public */
export const manageCardRef = createExtensionDataRef<ManageCardRef>().with({
  id: 'manage.card.ref',
});
