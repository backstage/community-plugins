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
import { useMemo, useState } from 'react';

import useIsomorphicLayoutEffect from 'react-use/esm/useIsomorphicLayoutEffect';

export function useMutationObserver(
  element: Element | undefined,
  options: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
  },
) {
  const [mutation, setMutation] = useState<MutationRecord | undefined>(
    undefined,
  );

  const observer = useMemo(
    () =>
      new window.MutationObserver(entries => {
        if (entries[0]) {
          setMutation(entries[0]);
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return;
    }
    observer.observe(element, options);

    // eslint-disable-next-line consistent-return
    return () => {
      observer.disconnect();
    };
  }, [element]);

  return mutation;
}
