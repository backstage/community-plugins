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

/**
 * Polyfill for NoInfer<T> which was added in TypeScript 5.4.
 * This workspace uses TypeScript 5.3, so we declare it globally to satisfy
 * transitive dependencies (e.g. react-aria-components) that use it.
 */
type NoInfer<T> = [T][T extends any ? 0 : never];

/**
 * Ambient module stub for lodash. Recharts imports lodash types internally but
 * does not ship @types/lodash as a dependency. This stub satisfies
 * tsc --skipLibCheck false without us needing @types/lodash as a direct dep.
 */
declare module 'lodash' {
  // Minimal surface needed by recharts (generateCategoricalChart.d.ts)
  interface DebouncedFunc<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
  }
}
