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

/**
 * Annotation identifying the GitHub repository of an entity, in the format
 * `<owner>/<repo>`.
 *
 * @public
 */
export const GITHUB_PROJECT_SLUG_ANNOTATION = 'github.com/project-slug';

/**
 * Annotation identifying the GitHub team of an entity, in the format
 * `<org>/<team>`.
 *
 * @public
 */
export const GITHUB_TEAM_SLUG_ANNOTATION = 'github.com/team-slug';

/**
 * Annotation identifying the GitHub user login of an entity.
 *
 * @public
 */
export const GITHUB_USER_LOGIN_ANNOTATION = 'github.com/user-login';
