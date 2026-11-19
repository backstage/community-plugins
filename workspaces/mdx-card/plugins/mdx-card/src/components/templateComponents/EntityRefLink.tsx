/*
 * Copyright 2026 The Backstage Authors
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
import { Fragment } from 'react';
import { Link } from '@backstage/ui';
import { useRouteRef } from '@backstage/core-plugin-api';
import type { CompoundEntityRef, Entity } from '@backstage/catalog-model';
import {
  entityRouteParams,
  entityRouteRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';

type EntityReference = Entity | CompoundEntityRef | string;

/**
 * Props for {@link EntityRefLink}.
 *
 * @public
 */
export type EntityRefLinkProps = {
  entityRef: EntityReference;
  /** Text shown instead of the entity's display name. */
  title?: string;
};

/**
 * Link to an entity page in templates.
 *
 * @public
 */
export const EntityRefLink = ({ entityRef, title }: EntityRefLinkProps) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(entityRef);
  return (
    <Link href={entityRoute(entityRouteParams(entityRef))}>
      {title ?? primaryTitle}
    </Link>
  );
};

/**
 * Props for {@link EntityRefLinks}.
 *
 * @public
 */
export type EntityRefLinksProps = {
  entityRefs: EntityReference[];
};

/**
 * Comma separated links to entity pages in templates.
 *
 * @public
 */
export const EntityRefLinks = ({ entityRefs }: EntityRefLinksProps) => (
  <>
    {entityRefs.map((entityRef, index) => (
      <Fragment key={index}>
        {index > 0 && ', '}
        <EntityRefLink entityRef={entityRef} />
      </Fragment>
    ))}
  </>
);
