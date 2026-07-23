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

type RoutedLinkProps = PropsWithChildren<{
  currentEntityPath: string;
  targetEntityPath: string;
}>;

const RoutedMaturityLink = ({
  currentEntityPath,
  targetEntityPath,
  children,
}: RoutedLinkProps) => {
  const maturityRoute = useRouteRef(rootRouteRef);

  return (
    <Link
      to={resolveMaturityRoute(
        maturityRoute(),
        currentEntityPath,
        targetEntityPath,
      )}
    >
      {children}
    </Link>
  );
};

export const MaturityLink = ({
  entity,
  children,
}: PropsWithChildren<Props>) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const targetEntityPath = entityRoute(entityRouteParams(entity));
  const { namespace, kind, name } = useParams();
  const content = children ?? <EntityDisplayName entityRef={entity} />;

  if (namespace && kind && name) {
    const currentEntityPath = entityRoute({ namespace, kind, name });

    return (
      <RoutedMaturityLink
        currentEntityPath={currentEntityPath}
        targetEntityPath={targetEntityPath}
      >
        {content}
      </RoutedMaturityLink>
    );
  }

  return (
    <Link to={joinRoutePath(targetEntityPath, '/maturity')}>{content}</Link>
  );
};
