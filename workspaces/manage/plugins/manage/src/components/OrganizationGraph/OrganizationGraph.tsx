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
import React, { useCallback, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Direction,
  EntityNode,
  EntityRelationsGraph,
} from '@backstage/plugin-catalog-graph';
import { getCompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import { EmptyState } from '@backstage/core-components';
import { useAnalytics, useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import { useOwners } from '@backstage-community/plugin-manage-react';

/**
 * An organization view for the current user.
 *
 * @public
 */
export function OrganizationGraphImpl() {
  const { ownedEntityRefs } = useOwners();

  const userEntityRef = useMemo(() => {
    return ownedEntityRefs
      .map(entityRef => parseEntityRef(entityRef))
      .find(
        compoundEntityRef =>
          compoundEntityRef.kind.toLocaleLowerCase('en-US') === 'user',
      );
  }, [ownedEntityRefs]);

  const navigate = useNavigate();
  const analytics = useAnalytics();
  const catalogEntityRoute = useRouteRef(entityRouteRef);

  const onNodeClick = useCallback(
    (node: EntityNode) => {
      const entity = node.entity
        ? getCompoundEntityRef(node.entity)
        : parseEntityRef(node.id);

      const path = catalogEntityRoute({
        kind: entity.kind.toLocaleLowerCase('en-US'),
        namespace: entity.namespace.toLocaleLowerCase('en-US'),
        name: entity.name,
      });
      analytics.captureEvent(
        'click',
        node.entity.metadata.title ?? humanizeEntityRef(entity),
        { attributes: { to: path } },
      );
      navigate(path);
    },
    [catalogEntityRoute, navigate, analytics],
  );

  if (!userEntityRef) {
    return <EmptyState title="Current user not found" missing="data" />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: 400,
        maxHeight: 600,
      }}
    >
      <EntityRelationsGraph
        rootEntityNames={userEntityRef}
        kinds={['Group']}
        curve="curveMonotoneX"
        direction={Direction.TOP_BOTTOM}
        mergeRelations
        maxDepth={Infinity}
        unidirectional
        relations={[
          'hasPart',
          'partOf',
          'parentOf',
          'childOf',
          'hasMember',
          'memberOf',
        ]}
        onNodeClick={onNodeClick}
        showArrowHeads
        zoom="enable-on-click"
      />
    </div>
  );
}
