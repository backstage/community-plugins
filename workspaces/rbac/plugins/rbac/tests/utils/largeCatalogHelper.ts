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
import path from 'node:path';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:7007';

/** MEMBERS_MODAL_THRESHOLD in AddMembersForm — modal when total > 100. */
export const MEMBERS_MODAL_THRESHOLD = 100;

/**
 * Absolute path to the large-catalog fixture (Playwright cwd = workspaces/rbac).
 * Registered via Catalog Locations API so default app-config stays small.
 */
export const LARGE_CATALOG_FIXTURE_PATH = path.resolve(
  process.cwd(),
  'plugins/rbac/tests/fixtures/large-catalog-org.yaml',
);

type CatalogLocation = { id: string; type: string; target: string };

async function captureBearerToken(page: Page): Promise<string> {
  const tokenPromise = page
    .waitForRequest(
      req =>
        req.url().includes('/api/') && Boolean(req.headers().authorization),
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
  expect(token, 'Expected a Bearer token from an /api request').toBeTruthy();
  return token;
}

async function getUserGroupTotal(
  request: APIRequestContext,
  token: string,
): Promise<number | null> {
  const headers = { Authorization: `Bearer ${token}` };
  const [usersRes, groupsRes] = await Promise.all([
    request.get(
      `${API_BASE}/api/catalog/entities/by-query?limit=1&filter=kind=user`,
      { headers },
    ),
    request.get(
      `${API_BASE}/api/catalog/entities/by-query?limit=1&filter=kind=group`,
      { headers },
    ),
  ]);
  if (!usersRes.ok() || !groupsRes.ok()) {
    return null;
  }
  const users = (await usersRes.json()) as { totalItems?: number };
  const groups = (await groupsRes.json()) as { totalItems?: number };
  return (users.totalItems ?? 0) + (groups.totalItems ?? 0);
}

export async function findLargeCatalogLocationId(
  request: APIRequestContext,
  token: string,
): Promise<string | undefined> {
  const response = await request.get(`${API_BASE}/api/catalog/locations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok()) {
    return undefined;
  }
  const body = (await response.json()) as
    | CatalogLocation[]
    | { items?: Array<{ data?: CatalogLocation }> };

  const locations: CatalogLocation[] = Array.isArray(body)
    ? body
    : (body.items ?? [])
        .map(item => item.data)
        .filter((loc): loc is CatalogLocation => Boolean(loc));

  return locations.find(
    loc =>
      loc.type === 'file' &&
      (loc.target === LARGE_CATALOG_FIXTURE_PATH ||
        loc.target.endsWith('large-catalog-org.yaml')),
  )?.id;
}

/**
 * Registers large-catalog-org.yaml through POST /api/catalog/locations.
 * Requires the rbac-backend dev harness to allow type "file".
 * Returns the location id (looks up on 409).
 */
export async function registerLargeCatalogFixture(
  request: APIRequestContext,
  token: string,
): Promise<string> {
  const response = await request.post(`${API_BASE}/api/catalog/locations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      type: 'file',
      target: LARGE_CATALOG_FIXTURE_PATH,
    },
  });
  const body = await response.text();

  if (response.status() === 201) {
    const parsed = JSON.parse(body) as {
      location?: CatalogLocation;
      entities?: unknown;
    };
    const id = parsed.location?.id;
    expect(id, `POST /locations 201 missing location.id: ${body}`).toBeTruthy();
    return id!;
  }

  if (response.status() === 409) {
    const existing = await findLargeCatalogLocationId(request, token);
    expect(
      existing,
      `POST /locations 409 but could not find large-catalog location: ${body}`,
    ).toBeTruthy();
    return existing!;
  }

  expect(
    false,
    `POST /api/catalog/locations failed (${response.status()}): ${body}`,
  ).toBeTruthy();
  return '';
}

export async function deleteLargeCatalogFixture(
  request: APIRequestContext,
  token: string,
  locationId: string,
) {
  const response = await request.delete(
    `${API_BASE}/api/catalog/locations/${locationId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  expect(
    response.ok() || response.status() === 404,
    `DELETE /api/catalog/locations/${locationId} failed (${response.status()}): ${await response.text()}`,
  ).toBeTruthy();
}

/**
 * Waits until catalog user+group total is above or below the modal threshold.
 */
export async function waitForCatalogTotal(
  request: APIRequestContext,
  token: string,
  opts: { minTotal?: number; maxTotal?: number; timeout?: number },
) {
  const { minTotal, maxTotal, timeout = 180_000 } = opts;
  const deadline = Date.now() + timeout;
  let lastTotal: number | null = null;
  while (Date.now() <= deadline) {
    lastTotal = await getUserGroupTotal(request, token);
    if (lastTotal !== null) {
      const aboveMin = minTotal === undefined || lastTotal >= minTotal;
      const belowMax = maxTotal === undefined || lastTotal <= maxTotal;
      if (aboveMin && belowMax) {
        return lastTotal;
      }
    }
    await new Promise(r => setTimeout(r, 2_000));
  }
  throw new Error(
    `Catalog user+group total=${lastTotal} did not satisfy ` +
      `min=${minTotal ?? '-'} max=${maxTotal ?? '-'} within ${timeout}ms ` +
      `(fixture ${LARGE_CATALOG_FIXTURE_PATH}).`,
  );
}

/** Register large fixture and wait until modal threshold is exceeded. */
export async function enableLargeCatalogForPage(page: Page): Promise<string> {
  const token = await captureBearerToken(page);
  const locationId = await registerLargeCatalogFixture(page.request, token);
  await waitForCatalogTotal(page.request, token, {
    minTotal: MEMBERS_MODAL_THRESHOLD + 1,
  });
  await page.reload();
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeHidden({
    timeout: 60_000,
  });
  return locationId;
}

/**
 * Unregister large fixture and wait until catalog is back under the modal
 * threshold (dropdown path). Safe to call if location already gone.
 */
export async function disableLargeCatalogForPage(
  page: Page,
  locationId?: string,
) {
  const token = await captureBearerToken(page);
  const id =
    locationId ?? (await findLargeCatalogLocationId(page.request, token));
  if (id) {
    await deleteLargeCatalogFixture(page.request, token, id);
  }
  await waitForCatalogTotal(page.request, token, {
    maxTotal: MEMBERS_MODAL_THRESHOLD,
  });
  await page.reload();
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeHidden({
    timeout: 60_000,
  });
}
