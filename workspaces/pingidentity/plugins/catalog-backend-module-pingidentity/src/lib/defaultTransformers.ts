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
