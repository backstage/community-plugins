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
import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { searchForRole } from './rbacHelper';
import {
  type SeedPolicy,
  getGuestsPolicies,
  getAdminPolicies,
  getAdminConditions,
} from './seedE2eData';

const API_BASE = 'http://127.0.0.1:7007';

/** Locale-scoped roles for full-stack e2e (REST source — editable in the UI). */
export type E2eRoles = {
  /** Short name used in role form / navigateToRole (e.g. guests-en). */
  guestsName: string;
  /** Full entity ref (e.g. role:default/guests-en). */
  guests: string;
  /** Short name (e.g. e2e_admin-en). Not rbac_admin — reserved for configuration. */
  rbacAdminName: string;
  rbacAdmin: string;
  /** Created by the create-role test. */
  sampleRoleName: string;
  sampleRole: string;
};

export function getE2eRoles(locale: string): E2eRoles {
  const guestsName = `guests-${locale}`;
  const rbacAdminName = `e2e_admin-${locale}`;
  const sampleRoleName = `sample-role-1-${locale}`;
  return {
    guestsName,
    guests: `role:default/${guestsName}`,
    rbacAdminName,
    rbacAdmin: `role:default/${rbacAdminName}`,
    sampleRoleName,
    sampleRole: `role:default/${sampleRoleName}`,
  };
}

function roleApiPath(roleEntityRef: string): string {
  // role:default/guests-en → /api/permission/roles/role/default/guests-en
  const [kind, rest] = roleEntityRef.split(':');
  const [namespace, name] = rest.split('/');
  return `/api/permission/roles/${kind}/${namespace}/${name}`;
}

function policiesApiPath(roleEntityRef: string): string {
  return roleApiPath(roleEntityRef).replace(
    '/api/permission/roles/',
    '/api/permission/policies/',
  );
}

async function apiDeleteRole(
  request: APIRequestContext,
  roleEntityRef: string,
  token: string,
) {
  const response = await request.delete(
    `${API_BASE}${roleApiPath(roleEntityRef)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  // (policies-rest-api treats missing metadata as NotAllowed, not NotFound).
  expect(
    response.ok() || response.status() === 404 || response.status() === 403,
    `DELETE ${roleEntityRef} failed (${response.status()}): ${await response.text()}`,
  ).toBeTruthy();
}

/**
 * DELETE /roles only removes members — permission policies stay in casbin.
 * Clear policies (and conditions) while role metadata still exists so GET works.
 */
async function apiDeletePoliciesForRole(
  request: APIRequestContext,
  roleEntityRef: string,
  token: string,
  knownPolicies?: SeedPolicy[],
) {
  const path = policiesApiPath(roleEntityRef);
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Delete whatever the API still lists (covers policies mutated by tests).
  const getResponse = await request.get(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (getResponse.ok()) {
    const policies = (await getResponse.json()) as Array<
      SeedPolicy & { metadata?: unknown }
    >;
    if (policies.length > 0) {
      const body = policies.map(
        ({ entityReference, permission, policy, effect }) => ({
          entityReference,
          permission,
          policy,
          effect,
        }),
      );
      const deleteResponse = await request.delete(`${API_BASE}${path}`, {
        data: body,
        headers,
      });
      expect(
        deleteResponse.ok() ||
          deleteResponse.status() === 404 ||
          deleteResponse.status() === 403,
        `DELETE ${path} failed (${deleteResponse.status()}): ${await deleteResponse.text()}`,
      ).toBeTruthy();
    }
  } else {
    expect(
      getResponse.status() === 404 || getResponse.status() === 403,
      `GET ${path} failed (${getResponse.status()}): ${await getResponse.text()}`,
    ).toBeTruthy();
  }

  // Orphan-safe: after role metadata is gone GET returns empty; remove known
  // seed rows one-by-one (batch DELETE 404s if any row is already absent).
  if (knownPolicies?.length) {
    for (const policy of knownPolicies) {
      const deleteResponse = await request.delete(`${API_BASE}${path}`, {
        data: [policy],
        headers,
      });
      expect(
        deleteResponse.ok() ||
          deleteResponse.status() === 404 ||
          deleteResponse.status() === 403,
        `DELETE policy ${JSON.stringify(policy)} failed (${deleteResponse.status()}): ${await deleteResponse.text()}`,
      ).toBeTruthy();
    }
  }
}

async function apiDeleteConditionsForRole(
  request: APIRequestContext,
  roleEntityRef: string,
  token: string,
) {
  const response = await request.get(
    `${API_BASE}/api/permission/roles/conditions`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { roleEntityRef },
    },
  );
  if (response.status() === 404) {
    return;
  }
  expect(
    response.ok(),
    `GET conditions failed (${response.status()}): ${await response.text()}`,
  ).toBeTruthy();

  const conditions = (await response.json()) as Array<{
    id?: number;
    roleEntityRef?: string;
  }>;
  for (const condition of conditions) {
    if (
      condition.id === undefined ||
      (condition.roleEntityRef && condition.roleEntityRef !== roleEntityRef)
    ) {
      continue;
    }
    const deleteResponse = await request.delete(
      `${API_BASE}/api/permission/roles/conditions/${condition.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(
      deleteResponse.ok() ||
        deleteResponse.status() === 404 ||
        deleteResponse.status() === 403,
      `DELETE condition ${condition.id} failed (${deleteResponse.status()}): ${await deleteResponse.text()}`,
    ).toBeTruthy();
  }
}

/** Full wipe so re-seed does not hit 409 on policies/roles/conditions. */
async function apiClearRole(
  request: APIRequestContext,
  roleEntityRef: string,
  token: string,
  knownPolicies?: SeedPolicy[],
) {
  await apiDeleteConditionsForRole(request, roleEntityRef, token);
  // Prefer listing via GET while metadata exists; also try knownPolicies for orphans.
  await apiDeletePoliciesForRole(request, roleEntityRef, token);
  if (knownPolicies?.length) {
    await apiDeletePoliciesForRole(
      request,
      roleEntityRef,
      token,
      knownPolicies,
    );
  }
  await apiDeleteRole(request, roleEntityRef, token);
}

async function apiPost(
  request: APIRequestContext,
  path: string,
  body: unknown,
  token: string,
  options?: { allowConflict?: boolean },
) {
  const response = await request.post(`${API_BASE}${path}`, {
    data: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await response.text();
  if (options?.allowConflict && response.status() === 409) {
    return response;
  }
  const hint =
    response.status() === 403
      ? ' Guest must be permission.rbac.admin.superUsers on the backend that owns :7007 (stop other Backstage apps / avoid reuseExistingServer).'
      : '';
  expect(
    response.ok(),
    `POST ${path} failed (${response.status()}): ${text}.${hint}`,
  ).toBeTruthy();
  return response;
}

async function waitForCatalogEntities(
  request: APIRequestContext,
  entityRefs: string[],
  token: string,
  timeout = 90_000,
) {
  const deadline = Date.now() + timeout;
  for (const entityRef of entityRefs) {
    const [kind, rest] = entityRef.split(':');
    const [namespace, name] = rest.split('/');
    const url = `${API_BASE}/api/catalog/entities/by-name/${kind}/${namespace}/${name}`;
    let found = false;
    while (!found) {
      if (Date.now() > deadline) {
        throw new Error(
          `Catalog entity ${entityRef} not found within ${timeout}ms — ` +
            'check that catalog-org.yaml is reachable from the backend CWD.',
        );
      }
      const response = await request.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok()) {
        found = true;
      } else {
        await new Promise(r => setTimeout(r, 2_000));
      }
    }
  }
}

/**
 * Creates editable guests + e2e_admin roles via REST (source: rest),
 * scoped with `-${locale}` so Playwright locale projects can share one
 * in-memory backend without colliding.
 *
 * Idempotent: clears conditions + policies + role before recreate (role DELETE
 * alone does not remove policies, which caused 409 on re-run).
 *
 * Call after guest login so a bearer token can be captured.
 */
export async function seedE2eRolesViaRest(page: Page, locale: string) {
  const roles = getE2eRoles(locale);
  const tokenPromise = page
    .waitForRequest(
      req =>
        req.url().includes('/api/permission') &&
        Boolean(req.headers().authorization),
      { timeout: 60_000 },
    )
    .then(req => {
      const header = req.headers().authorization ?? '';
      return header.replace(/^Bearer\s+/i, '');
    });

  await page.goto('/rbac');
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeHidden({
    timeout: 60_000,
  });

  const token = await tokenPromise;
  expect(
    token,
    'Expected a Bearer token from an /api/permission request',
  ).toBeTruthy();
  const { request } = page;

  const guestsPolicies = getGuestsPolicies(roles.guests);
  const adminPolicies = getAdminPolicies(roles.rbacAdmin);

  // Legacy unsuffixed names from older seeds (same policy shapes).
  const legacyGuests = 'role:default/guests';
  const legacyAdmin = 'role:default/e2e_admin';
  const legacyGuestsPolicies = guestsPolicies.map(p => ({
    ...p,
    entityReference: legacyGuests,
  }));
  const legacyAdminPolicies = adminPolicies.map(p => ({
    ...p,
    entityReference: legacyAdmin,
  }));

  // Wipe locale-scoped roles and any pre-suffix leftovers from older seeds.
  await apiClearRole(request, roles.guests, token, guestsPolicies);
  await apiClearRole(request, roles.rbacAdmin, token, adminPolicies);
  await apiClearRole(request, roles.sampleRole, token);
  await apiClearRole(request, legacyGuests, token, legacyGuestsPolicies);
  await apiClearRole(request, legacyAdmin, token, legacyAdminPolicies);
  await apiClearRole(request, 'role:default/sample-role-1', token);

  // guests
  await apiPost(
    request,
    '/api/permission/roles',
    {
      memberReferences: ['user:default/guest'],
      name: roles.guests,
      metadata: { description: `E2E guests role (${locale})` },
    },
    token,
    { allowConflict: true },
  );
  await apiPost(request, '/api/permission/policies', guestsPolicies, token, {
    allowConflict: true,
  });

  // e2e_admin (REST — not configuration default)
  await apiPost(
    request,
    '/api/permission/roles',
    {
      memberReferences: ['user:default/xyz', 'group:default/admins'],
      name: roles.rbacAdmin,
      metadata: { description: `E2E admin role (${locale})` },
    },
    token,
    { allowConflict: true },
  );
  await apiPost(request, '/api/permission/policies', adminPolicies, token, {
    allowConflict: true,
  });

  // Catalog conditional policies only — scaffolder backend is not in the
  // rbac-backend dev app, so scaffolder condition APIs return 500.
  const conditions = getAdminConditions(roles.rbacAdmin);

  for (const conditional of conditions) {
    await apiPost(
      request,
      '/api/permission/roles/conditions',
      conditional,
      token,
      { allowConflict: true },
    );
  }

  const rolesResponse = await request.get(`${API_BASE}/api/permission/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const rolesBody = await rolesResponse.text();
  expect(
    rolesResponse.ok(),
    `GET /api/permission/roles failed: ${rolesBody}`,
  ).toBeTruthy();
  const listed = JSON.parse(rolesBody) as Array<{ name: string }>;
  const roleNames = listed.map(r => r.name);
  expect(
    roleNames,
    `Expected seeded roles, got: ${roleNames.join(', ')}`,
  ).toEqual(expect.arrayContaining([roles.guests, roles.rbacAdmin]));

  // Wait for catalog entities needed by member-picker tests (catalog ingests
  // file locations asynchronously — they may not be ready immediately).
  const requiredEntities = [
    'group:default/team-d',
    'group:default/infrastructure',
    'user:default/amelia.park',
  ];
  await waitForCatalogEntities(request, requiredEntities, token);

  await page.reload();
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeHidden({
    timeout: 60_000,
  });
  await searchForRole(page, roles.guests, { timeout: 60_000 });
  await searchForRole(page, roles.rbacAdmin, { timeout: 60_000 });
}
