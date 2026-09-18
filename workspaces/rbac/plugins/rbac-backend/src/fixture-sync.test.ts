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

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { loadAll } from 'js-yaml';

interface KeycloakUser {
  username: string;
  email: string;
}

interface CatalogUser {
  metadata: { name: string };
  spec: { profile: { email: string } };
}

describe('keycloak and catalog fixture sync', () => {
  const realmPath = resolve(
    __dirname,
    '../__fixtures__/keycloak/backstage-realm.json',
  );
  const usersYamlPath = resolve(__dirname, '../__fixtures__/rbac/users.yaml');

  const realm = JSON.parse(readFileSync(realmPath, 'utf-8'));
  const realmUsers: KeycloakUser[] = realm.users;

  const catalogUsers = loadAll(readFileSync(usersYamlPath, 'utf-8')).filter(
    Boolean,
  ) as CatalogUser[];

  it('has the same set of usernames in both fixtures', () => {
    const realmNames = realmUsers.map(u => u.username).sort();
    const catalogNames = catalogUsers.map(u => u.metadata.name).sort();

    expect(realmNames).toEqual(catalogNames);
  });

  it('has matching emails for every user', () => {
    const realmByName = new Map(realmUsers.map(u => [u.username, u.email]));

    for (const user of catalogUsers) {
      expect(realmByName.get(user.metadata.name)).toBe(user.spec.profile.email);
    }
  });

  it('has password credentials set for every keycloak user', () => {
    for (const user of realmUsers) {
      const creds = (user as any).credentials;
      expect(creds).toBeDefined();
      expect(creds.length).toBeGreaterThan(0);
      expect(creds[0].type).toBe('password');
    }
  });
});
