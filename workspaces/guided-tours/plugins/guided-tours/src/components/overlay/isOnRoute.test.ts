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
import { isOnRoute, routeForStep } from './isOnRoute';

describe('isOnRoute', () => {
  it('matches the route and its sub paths', () => {
    expect(isOnRoute('/create', '/create')).toBe(true);
    expect(isOnRoute('/create', '/create/templates')).toBe(true);
    expect(isOnRoute('/create/', '/create/templates')).toBe(true);
    expect(isOnRoute('/create', '/created')).toBe(false);
    expect(isOnRoute('/create', '/settings')).toBe(false);
  });

  it('matches the root route only exactly', () => {
    expect(isOnRoute('/', '/')).toBe(true);
    expect(isOnRoute('/', '/catalog')).toBe(false);
  });
});

describe('routeForStep', () => {
  const steps = [{}, { route: '/example' }, {}, { route: '/' }, {}];

  it('returns the route of the step itself', () => {
    expect(routeForStep(steps, 1)).toBe('/example');
    expect(routeForStep(steps, 3)).toBe('/');
  });

  it('falls back to the closest earlier route', () => {
    expect(routeForStep(steps, 2)).toBe('/example');
    expect(routeForStep(steps, 4)).toBe('/');
  });

  it('returns undefined when no step so far set a route', () => {
    expect(routeForStep(steps, 0)).toBeUndefined();
    expect(routeForStep([], 0)).toBeUndefined();
  });
});
