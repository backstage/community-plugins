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
import { GroupTransformer, UserTransformer } from './types';

/**
 * The default group transformer if none is provided
 *
 * @param entity
 * @param _envId
 * @returns the transformed group entity with no transformations done
 */
export const defaultGroupTransformer: GroupTransformer = async (
  entity,
  _envId,
) => {
  entity.metadata.name = entity.metadata.name.replace(
    /[^a-zA-Z0-9_\-\.]/g,
    '_',
  );
  return entity;
};

/**
 * The default user transformer if none is provided
 *
 * @param entity
 * @param _envId
 * @param _groups
 * @returns the transformed user entity with the special characters in its username normalized to `_`
 */
export const defaultUserTransformer: UserTransformer = async (
  entity,
  _envId,
  _groups,
) => {
  entity.metadata.name = entity.metadata.name.replace(
    /[^a-zA-Z0-9_\-\.]/g,
    '_',
  );
  return entity;
};
