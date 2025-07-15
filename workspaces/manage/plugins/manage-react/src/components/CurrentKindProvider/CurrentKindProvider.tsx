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
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { useOwnedKinds } from '../OwnedProvider/OwnedProvider';
import { pluralizeKind } from '../../utils';
import { KindStarred, KindStarredType } from './types';

interface CurrentKindContext {
  kind: string | KindStarredType;
}

const ctx = createContext<CurrentKindContext>(undefined as any);

const { Provider } = ctx;

/**
 * Provider used by `@backstage-community/plugin-manage`, and shouldn't be used
 * elsewhere.
 *
 * @public
 */
export function CurrentKindProvider(
  props: PropsWithChildren<
    { kind: string; starred?: never } | { kind?: never; starred: true }
  >,
) {
  const { kind, starred, children } = props;

  const value = useMemo(() => {
    if (starred) {
      return { kind: KindStarred as KindStarredType };
    }
    return { kind };
  }, [kind, starred]);

  return <Provider value={value}>{children}</Provider>;
}

/**
 * Returns the current kind, i.e. if the component is inside a tab with only
 * components, or systems, e.g.
 *
 * If rendered outside such a tab, returns undefined.
 *
 * @public
 */
export function useCurrentKind(): string | KindStarredType | undefined {
  const context = useContext(ctx);
  if (!context) {
    return undefined;
  }
  return context.kind;
}

/**
 * Same as {@link useCurrentKind} except if not used inside a kind tab, it
 * fallbacks to all owned entity kinds.
 *
 * @param onlyOwned - Only return kinds for entities actually owned, otherwise
 *                    all configured kinds
 *
 * @public
 */
export function useCurrentKinds(
  onlyOwned = false,
): (string | KindStarredType)[] {
  const context = useContext(ctx);

  const currentKind = useMemo(() => {
    if (!context) {
      return undefined;
    }
    return [context.kind as string | KindStarredType];
  }, [context]);

  const ownedKinds = useOwnedKinds(onlyOwned);

  return currentKind ?? ownedKinds;
}

/**
 *
 * Returns the title for the current kind, e.g. "components" or
 * "starred entities".
 *
 * @public
 */
export function useCurrentKindTitle() {
  const kind = useCurrentKind();
  if (!kind) {
    return 'entities';
  }
  if (kind === KindStarred) {
    return 'starred entities';
  }
  return `${pluralizeKind(kind)}`;
}
