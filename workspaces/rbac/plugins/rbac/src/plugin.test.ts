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
import { rbacPlugin } from './plugin';

describe('RBAC plugin Legacy', () => {
  it('should export plugin', () => {
    expect(rbacPlugin).toBeDefined();
  });

  it('should have plugin id rbac', () => {
    expect(rbacPlugin.getId()).toBe('rbac');
  });

  it('should provide root, role, and createRole routes', () => {
    expect(rbacPlugin.routes.root).toBeDefined();
    expect(rbacPlugin.routes.role).toBeDefined();
    expect(rbacPlugin.routes.createRole).toBeDefined();
  });
});
