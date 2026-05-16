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

import { useEffect, useMemo } from 'react';
import {
  matchRoutes,
  useLocation,
  useNavigate,
  useParams,
  useRoutes,
} from 'react-router-dom';

import type { SubRouteTab } from './types';

/**
 * Ensure we're navigated to an existing tab, otherwise navigate to the first
 * tab.
 */
export function useTab<T extends SubRouteTab>(tabs: T[]): T {
  const reactRouterTabs = useMemo(
    () =>
      tabs.map(tab => ({
        ...tab,
        // Needed for react-router-dom to not print a warning
        element: tab.children,
        // Solves typing conflict with react-router-dom
        children: tab.children as any,
      })),
    [tabs],
  );

  const navigate = useNavigate();
  const location = useLocation();
  const element = useRoutes(reactRouterTabs, location);
  const currentPath = `/${useParams()['*']}`;
  const [matchedRoute] = matchRoutes(reactRouterTabs, currentPath) ?? [];

  // Navigate to the first tab if the current tab is not found
  useEffect(() => {
    if (!element) {
      navigate(tabs[0].path, { replace: true });
    }
  }, [element, navigate, tabs]);

  return matchedRoute?.route ?? tabs[0];
}
