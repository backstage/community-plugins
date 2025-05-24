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
  getCompoundEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';
import { createRouteRef, useRouteRef } from '@backstage/core-plugin-api';
import { EntityDisplayName } from '@backstage/plugin-catalog-react';
import { getOrCreateGlobalSingleton } from '@backstage/version-bridge';
import { PropsWithChildren } from 'react';

const entityRouteRef = getOrCreateGlobalSingleton(
  'catalog:entity-route-ref',
  () =>
    createRouteRef({
      id: 'catalog:entity',
      params: ['namespace', 'kind', 'name'],
    }),
);

type Props = {
  entity: Entity | string;
};

export const MaturityLink = ({
  entity,
  children,
}: PropsWithChildren<Props>) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const compoundEntityRef =
    typeof entity === 'string'
      ? parseEntityRef(entity)
      : getCompoundEntityRef(entity);

  return (
    <Link to={`${entityRoute(compoundEntityRef)}/maturity`}>
      {children ?? <EntityDisplayName entityRef={compoundEntityRef} />}
    </Link>
  );
};
