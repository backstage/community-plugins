import { Entity } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import { createParticipant } from './utils/participantUtils';

export class EntityService {
  private catalogApi: CatalogApi;

  constructor(catalogApi: CatalogApi) {
    this.catalogApi = catalogApi;
  }

  async fetchEntities(): Promise<Entity[]> {
    const response = await this.catalogApi.getEntities({
      filter: [{ kind: 'User' }, { kind: 'Group' }],
    });
    return response.items;
  }

  async fetchGroupMembers(groupName: string): Promise<Entity[]> {
    const response = await this.catalogApi.getEntities({
      filter: {
        kind: 'User',
        'relations.memberOf': [`group:default/${groupName}`],
      },
    });

    return response.items;
  }

  async resolveParticipants(
    selectedEntities: Entity[],
    excludedUsers: Set<string>,
  ): Promise<
    Array<{
      id: string;
      name: string;
      displayName: string;
      fromGroup?: string;
    }>
  > {
    const participants = [];

    for (const entity of selectedEntities) {
      if (!entity.metadata.uid) continue;

      if (entity.kind === 'Group') {
        // For groups, fetch all members
        const groupMembers = await this.fetchGroupMembers(entity.metadata.name);

        // Add each group member to participants, but skip excluded users
        for (const member of groupMembers) {
          if (!member.metadata.uid) continue;
          if (excludedUsers.has(member.metadata.uid)) continue;

          participants.push(createParticipant(member, entity.metadata.name));
        }
      } else {
        // Add individual users directly
        participants.push(createParticipant(entity));
      }
    }

    return participants;
  }
}
