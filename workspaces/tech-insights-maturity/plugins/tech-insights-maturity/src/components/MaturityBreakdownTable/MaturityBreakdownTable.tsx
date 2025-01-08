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
import {
  Entity,
  RELATION_HAS_PART,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PARENT_OF,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  EntityTable,
  useEntity,
  useRelatedEntities,
} from '@backstage/plugin-catalog-react';
import Grid from '@mui/material/Grid';
import React from 'react';

import { MaturityRankWidget } from '../MaturityRankWidget';

const processEntity = (entity: Entity) => {
  const entityType = entity.spec?.type?.toString();
  let relationType = RELATION_HAS_PART;
  let relationKind = '';
  let title = 'Children';
  const columns = [EntityTable.columns.createEntityRefColumn({})];

  switch (entity.kind) {
    case 'System':
      title = 'Components';
      relationKind = 'component';
      columns.push(
        EntityTable.columns.createEntityRelationColumn({
          title: 'Team',
          relation: RELATION_OWNED_BY,
          defaultKind: 'group',
        }),
      );
      break;
    case 'Domain':
      title = 'Products';
      break;
    case 'Group':
      if (entityType === 'organization') {
        relationType = RELATION_PARENT_OF;
        title = 'Organizations';
        columns.push(
          EntityTable.columns.createEntityRelationColumn({
            title: 'Product Families',
            relation: RELATION_OWNER_OF,
            defaultKind: 'group',
          }),
        );
        break;
      } else if (entityType === 'solution-line') {
        relationType = RELATION_OWNER_OF;
        title = 'Product Families';
        columns.push(
          EntityTable.columns.createEntityRelationColumn({
            title: 'Products',
            relation: RELATION_HAS_PART,
            defaultKind: 'system',
          }),
        );
        break;
      }
      relationType = RELATION_OWNER_OF;
      relationKind = 'component';
      title = 'Components';
      columns.push(
        EntityTable.columns.createEntityRelationColumn({
          title: 'Product',
          relation: RELATION_PART_OF,
          defaultKind: 'system',
        }),
        {
          title: 'Description',
          field: 'metadata.description',
        },
      );
      break;
    default:
      break;
  }

  columns.push({
    title: 'Maturity',
    field: 'entity.metadata.not_used',
    render: (e: Entity) => <MaturityRankWidget entity={e} chip />,
  });

  return { title, type: relationType, kind: relationKind, columns };
};

export const MaturityBreakdownTable = () => {
  const { entity } = useEntity();
  const { title, type, kind, columns } = processEntity(entity);

  const {
    entities = [],
    loading,
    error,
  } = useRelatedEntities(entity, {
    type,
    kind,
  });

  if (loading || error) {
    return <> </>;
  }

  return (
    <Grid item>
      <EntityTable
        title={title}
        columns={columns}
        entities={entities.filter(e => e.spec?.type !== 'team')}
      />
    </Grid>
  );
};
