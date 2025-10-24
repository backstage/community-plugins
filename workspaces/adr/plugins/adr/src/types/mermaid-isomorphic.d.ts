/*
 * Copyright 2023 The Backstage Authors
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
 * Type declarations for mermaid-isomorphic.
 * Re-exports actual types from the package's distribution.
 */
declare module 'mermaid-isomorphic' {
  import def from 'mermaid-isomorphic/dist/mermaid-isomorphic';

  export * from 'mermaid-isomorphic/dist/mermaid-isomorphic';
  export default def;
}
