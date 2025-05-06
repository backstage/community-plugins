/*
 * Copyright 2024 The Backstage Authors
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
import { pluginId } from '@backstage-community/plugin-kiali-common';
import { HeaderTabs } from '@backstage/core-components';
import { useCallback, useEffect } from 'react';
import { matchRoutes, useNavigate, useParams } from 'react-router-dom';
import {
  appsRouteRef,
  istioConfigRouteRef,
  overviewRouteRef,
  servicesRouteRef,
  trafficGraphRouteRef,
  workloadsRouteRef,
} from '../../../routes';

const tabs = [
  { id: 'overview', label: 'Overview', path: overviewRouteRef.path },
  { id: 'graph', label: 'Traffic Graph', path: trafficGraphRouteRef.path },
  { id: 'workloads', label: 'Workloads', path: workloadsRouteRef.path },
  { id: 'services', label: 'Services', path: servicesRouteRef.path },
  { id: 'apps', label: 'Applications', path: appsRouteRef.path },
  { id: 'istio', label: 'Istio Config', path: istioConfigRouteRef.path },
];
export const KialiTabs = () => {
  const currentPath = `/${useParams()['*']}`;
  const [matchedRoute] = matchRoutes(tabs, currentPath) ?? [];

  const currentTabIndex = matchedRoute
    ? tabs.findIndex(t => t.path === matchedRoute.route.path)
    : 0;

  const navigate = useNavigate();
  const handleTabChange = useCallback(
    (index: number) => {
      navigate(`/${pluginId}${tabs[index].path}`);
    },
    [navigate],
  );
  useEffect(() => {
    if (currentTabIndex === 0) {
      navigate(`/${pluginId}${tabs[0].path}`);
    }
  }, [currentTabIndex, navigate]);

  return (
    <HeaderTabs
      selectedIndex={currentTabIndex}
      onChange={handleTabChange}
      tabs={tabs}
    />
  );
};
