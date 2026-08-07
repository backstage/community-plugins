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
import { argocdPermissions, argocdViewPermission } from './permissions';

describe('argocd permissions', () => {
  it('should define argocdViewPermission with the expected name and attributes', () => {
    expect(argocdViewPermission.name).toBe('argocd.view.read');
    expect(argocdViewPermission.attributes).toEqual({ action: 'read' });
  });

  it('should export argocdPermissions containing exactly argocdViewPermission', () => {
    expect(argocdPermissions).toHaveLength(1);
    expect(argocdPermissions).toContain(argocdViewPermission);
  });
});
