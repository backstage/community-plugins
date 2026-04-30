/*
 * Copyright 2020 The Backstage Authors
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
  attachComponentData,
  useElementFilter,
  useRouteRef,
} from '@backstage/core-plugin-api';
import { HeaderTab, PluginHeader } from '@backstage/ui';
import { TabProps } from '@material-ui/core/Tab';
import { default as React, useMemo } from 'react';
import { useRoutes } from 'react-router-dom';
import { exploreRouteRef } from '../../routes';

// TODO: This layout could be a shared based component if it was possible to create custom TabbedLayouts
//    A generalized version of createSubRoutesFromChildren, etc. would be required
/** @public */
export type SubRoute = {
  path: string;
  title: string;
  children: JSX.Element;
  tabProps?: TabProps<React.ElementType, { component?: React.ElementType }>;
};

const dataKey = 'plugin.explore.exploreLayoutRoute';

const RouteData: (props: SubRoute) => null = () => null;
attachComponentData(RouteData, dataKey, true);

// This causes all mount points that are discovered within this route to use the path of the route itself
attachComponentData(RouteData, 'core.gatherMountPoints', true);

/** @public */
export type ExploreLayoutProps = {
  title?: string;
  /**
   * @deprecated The Backstage UI `PluginHeader` does not render a subtitle.
   * This prop is kept for backwards compatibility but is no longer displayed.
   */
  subtitle?: string;
  children?: React.ReactNode;
};

const stripLeadingSlash = (path: string) => path.replace(/^\/+/, '');

const joinPaths = (base: string, sub: string) => {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedSub = stripLeadingSlash(sub);
  return trimmedSub ? `${trimmedBase}/${trimmedSub}` : trimmedBase;
};

/**
 * Explore is a compound component, which allows you to define a custom layout
 *
 * @example
 * ```jsx
 * <ExploreLayout title="Explore ACME's ecosystem">
 *   <ExploreLayout.Route path="/example" title="Example tab">
 *     <div>This is rendered under /example/anything-here route</div>
 *   </ExploreLayout.Route>
 * </ExploreLayout>
 * ```
 *
 * @public
 */
export const ExploreLayout = (props: ExploreLayoutProps) => {
  const { title, children } = props;

  const exploreRoutePath = useRouteRef(exploreRouteRef);

  const routes = useElementFilter(children, elements =>
    elements
      .selectByComponentData({
        key: dataKey,
        withStrictError:
          'Child of ExploreLayout must be an ExploreLayout.Route',
      })
      .getElements<SubRoute>()
      .map(child => child.props),
  );

  const basePath = exploreRoutePath ? exploreRoutePath() : '';

  const tabs = useMemo<HeaderTab[]>(
    () =>
      routes.map(route => ({
        id: route.path,
        label: route.title,
        href: joinPaths(basePath, route.path),
        matchStrategy: 'prefix',
      })),
    [routes, basePath],
  );

  // Render the matching sub-route's content inline, falling back to the first
  // tab's content if no sub-path is present (matching the legacy RoutedTabs
  // behavior). We intentionally don't redirect, so the layout still works when
  // it is mounted at the root path.
  const element = useRoutes(
    routes.map(route => ({
      path: `${stripLeadingSlash(route.path)}/*`,
      element: route.children,
    })),
  );

  return (
    <>
      <PluginHeader title={title ?? 'Explore our ecosystem'} tabs={tabs} />
      {element ?? routes[0]?.children ?? null}
    </>
  );
};

ExploreLayout.Route = RouteData;
