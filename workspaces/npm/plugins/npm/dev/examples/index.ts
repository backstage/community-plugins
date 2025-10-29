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

export { npmjsExamples } from './npmjs-examples';
export { githubExamples } from './github-examples';
export { gitlabExamples } from './gitlab-examples';
export { failingExamples } from './failing-examples';

import { npmjsExamples } from './npmjs-examples';
import { githubExamples } from './github-examples';
import { gitlabExamples } from './gitlab-examples';
import { failingExamples } from './failing-examples';

export const allExamples = [
  ...npmjsExamples,
  ...githubExamples,
  ...gitlabExamples,
  ...failingExamples,
];
