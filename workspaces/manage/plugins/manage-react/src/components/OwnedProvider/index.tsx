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
import { PropsWithChildren } from 'react';

import { OwnedProvider } from './OwnedProvider';

export {
  useOwnedKinds,
  useOwnedEntities,
  useManagedEntities,
  useOwners,
} from './OwnedProvider';

/** @public */
export interface OwnedProviderProps {
  kinds?: string[];
}

/**
 * This is an internal component and should not be used directly.
 *
 * @public
 */
export function ManageOwnedProvider(
  props: PropsWithChildren<OwnedProviderProps>,
) {
  return <OwnedProvider kinds={props.kinds} children={props.children} />;
}
