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
import { createExtensionPoint } from '@backstage/backend-plugin-api';

import { GroupTransformer, UserTransformer } from './lib/types';

/**
 * An extension point that exposes the ability to implement user and group transformer functions for ping identity.
 *
 * @public
 */
export const pingIdentityTransformerExtensionPoint =
  createExtensionPoint<PingIdentityTransformerExtensionPoint>({
    id: 'pingIdentity.transformer',
  });

/**
 * The interface for {@link pingIdentityTransformerExtensionPoint}.
 *
 * @public
 */
export type PingIdentityTransformerExtensionPoint = {
  setUserTransformer(userTransformer: UserTransformer): void;
  setGroupTransformer(groupTransformer: GroupTransformer): void;
};
