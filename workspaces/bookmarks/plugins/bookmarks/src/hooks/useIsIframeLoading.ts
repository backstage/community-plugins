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

import { useEffect, useState } from 'react';

/** Tracks the loading state of an iframe */
export const useIsIframeLoading = (
  ref: React.RefObject<HTMLIFrameElement>,
  src: string,
): boolean => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const iframe = ref.current;

    // we have to make sure that iframe is defined before adding event listeners
    if (!iframe) {
      return undefined; // return undefined to avoid consistent-return eslint error
    }

    const done = () => setLoading(false);
    iframe.addEventListener('load', done);
    iframe.addEventListener('error', done);
    setLoading(true);

    return () => {
      iframe.removeEventListener('load', done);
      iframe.removeEventListener('error', done);
    };
  }, [ref, src]);

  return loading;
};
