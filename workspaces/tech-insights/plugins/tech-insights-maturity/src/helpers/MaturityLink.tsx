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
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useRouteRef as useOptionalRouteRef } from '@backstage/frontend-plugin-api';
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
 * The maturity route, for resolving with the `@backstage/frontend-plugin-api`
 * `useRouteRef`. Unlike the `@backstage/core-plugin-api` hook, which throws, it
 * returns `undefined` for a route that is not mounted. That is the case
 * whenever an app installs `EntityMaturitySummaryCard` or
 * `EntityMaturityRankWidget` without also adding one of the maturity contents
 * to the entity page.
 */
const maturityRouteRef = convertLegacyRouteRef(rootRouteRef);

type RoutedLinkProps = PropsWithChildren<{
  currentEntityPath: string;
  targetEntityPath: string;
}>;

const RoutedMaturityLink = ({
  currentEntityPath,
  targetEntityPath,
  children,
}: RoutedLinkProps) => {
  const maturityRoute = useOptionalRouteRef(maturityRouteRef);

  const to = maturityRoute
    ? resolveMaturityRoute(maturityRoute(), currentEntityPath, targetEntityPath)
    : joinRoutePath(targetEntityPath, DEFAULT_MATURITY_PATH);

  return <Link to={to}>{children}</Link>;
};

export const MaturityLink = ({
  entity,
  children,
}: PropsWithChildren<Props>) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const { namespace, kind, name } = useParams();

  const targetEntityPath = entityRoute(entityRouteParams(entity));
  const content = children ?? <EntityDisplayName entityRef={entity} />;

  // The maturity route is mounted beneath the entity route, so it can only be
  // resolved from an entity page.
  if (!namespace || !kind || !name) {
    return (
      <Link to={joinRoutePath(targetEntityPath, DEFAULT_MATURITY_PATH)}>
        {content}
      </Link>
    );
  }

  // `compatWrapper` provides the route resolution API that the
  // frontend-plugin-api hook relies on in apps on the legacy frontend system.
  return compatWrapper(
    <RoutedMaturityLink
      currentEntityPath={entityRoute({ namespace, kind, name })}
      targetEntityPath={targetEntityPath}
    >
      {content}
    </RoutedMaturityLink>,
  );
};
