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
import type { GroupTransformer, UserTransformer } from './types';

/**
 * @public
 * Group transformer that does nothing.
 */
export const noopGroupTransformer: GroupTransformer = async (
  entity,
  _user,
  _realm,
) => entity;

/**
 * @public
 * User transformer that does nothing.
 */
export const noopUserTransformer: UserTransformer = async (
  entity,
  _user,
  _realm,
  _groups,
) => entity;

/**
 * @public
 * User transformer that sanitizes .metadata.name from email address to a valid name
 */
export const sanitizeEmailTransformer: UserTransformer = async (
  entity,
  _user,
  _realm,
  _groups,
) => {
  entity.metadata.name = entity.metadata.name.replace(/[^a-zA-Z0-9]/g, '-');
  return entity;
};

/**
 * @public
 * User transformer that sanitizes .metadata.name from invalid Backstage object name to a valid name
 */
export const sanitizeUserNameTransformer: UserTransformer = async (
  entity,
  _user,
  _realm,
  _groups,
) => {
  entity.metadata.name = entity.metadata.name.replace(/[^a-zA-Z0-9\-_.]/g, '-');
  return entity;
};

/**
 * @public
 * Group transformer that sanitizes .metadata.name from invalid Backstage object name to a valid name
 */
export const sanitizeGroupNameTransformer: GroupTransformer = async (
  entity,
  _user,
  _realm,
) => {
  entity.metadata.name = entity.metadata.name.replace(/[^a-zA-Z0-9\-_.]/g, '-');
  return entity;
};
