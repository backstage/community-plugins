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
import { GuidedTourElementLoader } from '@backstage-community/plugin-guided-tours-react';
import { JSX, useEffect, useState } from 'react';

/** Loaded elements per loader, so Previous/Next do not fetch again. */
const cache = new WeakMap<
  GuidedTourElementLoader['loader'],
  Promise<JSX.Element>
>();

export interface LoadedElement {
  status: 'none' | 'loading' | 'ready' | 'error';
  element?: JSX.Element;
  error?: Error;
}

/**
 * Resolves a step's element loader before the step is shown, so the card
 * appears with its final content instead of growing after a chunk loads.
 */
export function useLoadedElement(
  loader: GuidedTourElementLoader['loader'] | undefined,
): LoadedElement {
  const [state, setState] = useState<LoadedElement>({ status: 'none' });

  useEffect(() => {
    if (!loader) {
      setState({ status: 'none' });
      return undefined;
    }
    let cancelled = false;
    let promise = cache.get(loader);
    if (!promise) {
      promise = loader();
      cache.set(loader, promise);
    }
    setState({ status: 'loading' });
    promise.then(
      element => !cancelled && setState({ status: 'ready', element }),
      error => {
        cache.delete(loader);
        if (!cancelled) setState({ status: 'error', error });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loader]);

  return state;
}
