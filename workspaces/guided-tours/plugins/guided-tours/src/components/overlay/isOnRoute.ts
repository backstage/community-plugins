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

/**
 * Whether the current pathname is "on" a step route. A route matches
 * itself and any sub path (pages often redirect to a sub path, e.g.
 * `/create` to `/create/templates`); the root route only matches exactly.
 */
export function isOnRoute(route: string, pathname: string): boolean {
  const base = route.replace(/\/+$/, '') || '/';
  if (base === '/') {
    return pathname === '/' || pathname === '';
  }
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * The page a step belongs to: its own `route`, or the route of the closest
 * earlier step that set one. A step without a route stays on the page the
 * tour reached before it.
 */
export function routeForStep(
  steps: ReadonlyArray<{ route?: string }>,
  stepIndex: number,
): string | undefined {
  for (let i = Math.min(stepIndex, steps.length - 1); i >= 0; i--) {
    const route = steps[i]?.route;
    if (route) {
      return route;
    }
  }
  return undefined;
}
