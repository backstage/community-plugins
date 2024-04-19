/*
 * Copyright 2021 The Backstage Authors
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

import { DomainEntity, RELATION_OWNED_BY } from '@backstage/catalog-model';
import {
  EntityRefLinks,
  entityRouteParams,
  getEntityRelations,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import React from 'react';

import { LinkButton, ItemCardHeader } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

/** @public */
export const DomainCard = (props: { entity: DomainEntity }) => {
  const { entity } = props;

  const catalogEntityRoute = useRouteRef(entityRouteRef);
  const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
  const url = catalogEntityRoute(entityRouteParams(entity));

  const owner = (
    <EntityRefLinks
      entityRefs={ownedByRelations}
      defaultKind="group"
      color="inherit"
    />
  );

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader
          title={entity.metadata.title ?? entity.metadata.name}
          subtitle={owner}
        />
      </CardMedia>
      <CardContent>
        {entity.metadata.tags?.length ? (
          <Box>
            {entity.metadata.tags.map(tag => (
              <Chip size="small" label={tag} key={tag} />
            ))}
          </Box>
        ) : null}
        {entity.metadata.description}
      </CardContent>
      <CardActions>
        <LinkButton to={url} color="primary">
          Explore
        </LinkButton>
      </CardActions>
    </Card>
  );
};
