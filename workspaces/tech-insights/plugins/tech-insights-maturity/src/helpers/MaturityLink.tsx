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
import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  EntityDisplayName,
  entityRouteParams,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import { rootRouteRef } from '../routes';

type Props = {
  entity: Entity | string;
};

const DEFAULT_MATURITY_PATH = '/maturity';

function joinRoutePath(basePath: string, childPath: string): string {
  return `${basePath.replace(/\/$/, '')}/${childPath.replace(/^\//, '')}`;
}

export function resolveMaturityRoute(
  currentMaturityPath: string,
  currentEntityPath: string,
  targetEntityPath: string,
): string {
  const maturityPath = currentMaturityPath.startsWith(currentEntityPath)
    ? currentMaturityPath.slice(currentEntityPath.length)
    : currentMaturityPath;

  return maturityPath
    ? joinRoutePath(targetEntityPath, maturityPath)
    : targetEntityPath;
}

/**
 * Resolves the maturity route, or `undefined` when it cannot be resolved from
 * the current location.
 *
 * `useRouteRef` throws for a route ref that is not mounted, which is the case
 * whenever an app installs `EntityMaturitySummaryCard` or
 * `EntityMaturityRankWidget` without also adding one of the maturity contents
 * to the entity page. Every hook `useRouteRef` uses runs before it throws, so
 * catching here leaves the hook order unchanged between renders.
 */
function useOptionalMaturityRoute() {
  try {
    return useRouteRef(rootRouteRef);
  } catch {
    return undefined;
  }
}

export const MaturityLink = ({
  entity,
  children,
}: PropsWithChildren<Props>) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const maturityRoute = useOptionalMaturityRoute();
  const { namespace, kind, name } = useParams();

  const targetEntityPath = entityRoute(entityRouteParams(entity));
  const content = children ?? <EntityDisplayName entityRef={entity} />;

  const to =
    maturityRoute && namespace && kind && name
      ? resolveMaturityRoute(
          maturityRoute(),
          entityRoute({ namespace, kind, name }),
          targetEntityPath,
        )
      : joinRoutePath(targetEntityPath, DEFAULT_MATURITY_PATH);

  return <Link to={to}>{content}</Link>;
};
