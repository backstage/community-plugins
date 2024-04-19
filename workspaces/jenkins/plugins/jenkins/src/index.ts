/*
 * Copyright 2020 The Backstage Authors
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
 * A Backstage plugin that integrates towards Jenkins
 *
 * @packageDocumentation
 */

export {
  jenkinsPlugin,
  jenkinsPlugin as plugin,
  EntityJenkinsContent,
  EntityLatestJenkinsRunCard,
  EntityJobRunsTable,
} from './plugin';
export { LatestRunCard } from './components/Cards';
export {
  Router,
  isJenkinsAvailable,
  isJenkinsAvailable as isPluginApplicableToEntity,
} from './components/Router';
export { JENKINS_ANNOTATION, LEGACY_JENKINS_ANNOTATION } from './constants';
export * from './api';
