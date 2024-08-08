import { GroupTransformer, UserTransformer } from './types';

export const defaultGroupTransformer: GroupTransformer = async (
  entity,
  _envId,
) => entity;

export const defaultUserTransformer: UserTransformer = async (
  entity,
  _envId,
  _groups,
) => {
  entity.metadata.name = entity.metadata.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  return entity;
};