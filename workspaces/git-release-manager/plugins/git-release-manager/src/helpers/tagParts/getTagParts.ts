/*
 * Copyright 2021 The Backstage Authors
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

import { getCalverTagParts } from './getCalverTagParts';
import { getSemverTagParts } from './getSemverTagParts';
import { Project } from '../../contexts/ProjectContext';

/**
 * Tag parts are the individual parts of a version, e.g. [major].[minor].[patch]
 * are the parts of a semantic version
 *
 * @public
 */
export function getTagParts(options: { project: Project; tag: string }) {
  if (options.project.versioningStrategy === 'calver') {
    return getCalverTagParts(options.tag);
  }

  return getSemverTagParts(options.tag);
}
