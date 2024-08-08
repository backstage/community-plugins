import { GroupEntity, UserEntity } from '@backstage/catalog-model';

/**
 * Customize the ingested User entity
 *
 * @public
 *
 * @param {UserEntity} entity The output of the default parser
 * @param {GroupRepresentationWithParentAndEntity[]} groups Data about available groups (can be used to create additional relationships)
 *
 * @returns {Promise<UserEntity | undefined>} Resolve to a modified `UserEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type UserTransformer = (
    entity: UserEntity,
    envId: string,
    groups: GroupEntity[],
  ) => Promise<UserEntity | undefined>;
  
  /**
   * Customize the ingested Group entity
   *
   * @public
   *
   * @param {GroupEntity} entity The output of the default parser
   * @param {string} realm Realm name
   *
   * @returns {Promise<GroupEntity | undefined>} Resolve to a modified `GroupEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
   */
  export type GroupTransformer = (
    entity: GroupEntity,
    envId: string,
  ) => Promise<GroupEntity | undefined>;
  