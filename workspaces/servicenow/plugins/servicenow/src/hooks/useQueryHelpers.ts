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

import { useSearchParams } from 'react-router-dom';

export function useUpdateQueryParams() {
  const [, setSearchParams] = useSearchParams();

  return (updates: Record<string, string>) => {
    setSearchParams(
      prev => {
        const params = new URLSearchParams(prev);
        for (const key in updates) {
          if (updates[key] === '') {
            params.delete(key);
          } else {
            params.set(key, updates[key]);
          }
        }
        return params;
      },
      { replace: true },
    );
  };
}
