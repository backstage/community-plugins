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
import {
  CompoundEntityRef,
  Entity,
  parseEntityRef,
} from '@backstage/catalog-model';
import {
  entityRouteParams,
  entityRouteRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';

type EntityReference = Entity | CompoundEntityRef | string;

type RefDefaults = {
  /** Kind used when a string ref has no kind, e.g. `group` for `team-a`. */
  defaultKind?: string;
  /** Namespace used when a string ref has no namespace. Defaults to `default`. */
  defaultNamespace?: string;
};

const resolveRef = (
  entityRef: EntityReference,
  { defaultKind, defaultNamespace }: RefDefaults,
) =>
  typeof entityRef === 'string'
    ? parseEntityRef(entityRef, { defaultKind, defaultNamespace })
    : entityRef;

/**
 * Props for {@link EntityRefLink}.
 *
 * @public
 */
export type EntityRefLinkProps = RefDefaults & {
  entityRef: EntityReference;
  /** Text shown instead of the entity's display name. */
  title?: string;
};

/**
 * Link to an entity page in templates.
 *
 * @public
 */
export const EntityRefLink = ({
  entityRef,
  title,
  ...defaults
}: EntityRefLinkProps) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const ref = resolveRef(entityRef, defaults);
  const { primaryTitle } = useEntityPresentation(ref);
  return (
    <Link href={entityRoute(entityRouteParams(ref))}>
      {title ?? primaryTitle}
    </Link>
  );
};

/**
 * Props for {@link EntityRefLinks}.
 *
 * @public
 */
export type EntityRefLinksProps = RefDefaults & {
  entityRefs: EntityReference[];
};

/**
 * Comma separated links to entity pages in templates.
 *
 * @public
 */
export const EntityRefLinks = ({
  entityRefs,
  ...defaults
}: EntityRefLinksProps) => (
  <>
    {entityRefs.map((entityRef, index) => (
      <Fragment key={index}>
        {index > 0 && ', '}
        <EntityRefLink entityRef={entityRef} {...defaults} />
      </Fragment>
    ))}
  </>
);
