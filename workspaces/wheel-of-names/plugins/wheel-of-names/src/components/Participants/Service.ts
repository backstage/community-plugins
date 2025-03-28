/*
 * Copyright 2025 The Backstage Authors
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
