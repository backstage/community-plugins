import { Entity } from '@backstage/catalog-model';
export interface Participant {
  id: string;
  name: string;
  displayName: string;
  fromGroup?: string;
}

export const createParticipant = (
  entity: Entity,
  fromGroup?: string,
): Participant => {
  if (!entity.metadata.uid) {
    throw new Error('Cannot create participant from entity without UID');
  }

  return {
    id: entity.metadata.uid,
    name: entity.metadata.name,
    displayName: getUserDisplayName(entity),
    fromGroup,
  };
};

export const isFromGroup = (participant: Participant): boolean => {
  return !!participant.fromGroup;
};

export const getUserDisplayName = (user?: Entity): string => {
  if (!user) return '';

  // Default to metadata.title or metadata.name
  let displayName = user.metadata.title || user.metadata.name;

  // Check if profile exists and has displayName
  const profile = user.spec?.profile;
  if (
    profile &&
    typeof profile === 'object' &&
    profile !== null &&
    'displayName' in profile &&
    typeof profile.displayName === 'string'
  ) {
    displayName = profile.displayName || displayName;
  }

  return displayName;
};

export const getEntityUid = (entity: Entity): string | undefined => {
  return entity.metadata.uid;
};

export const isGroupEntity = (entity: Entity): boolean => {
  return entity.kind === 'Group';
};
