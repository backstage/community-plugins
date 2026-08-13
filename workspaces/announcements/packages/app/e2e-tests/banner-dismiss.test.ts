/*
 * Copyright 2025 The Backstage Authors
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

import { test, expect, Page } from '@playwright/test';

const signInAsGuest = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.getByText('New announcement banner')).toBeVisible();
};

const createActiveAnnouncement = async (page: Page, title: string) => {
  await page.goto('/announcements/admin');
  await page.getByRole('button', { name: 'Create announcement' }).click();

  const form = page.locator('form');
  await form.getByRole('textbox', { name: 'Title' }).fill(title);
  await form.getByRole('textbox', { name: 'Excerpt' }).fill(`${title} excerpt`);
  await form.locator('textarea').first().fill(`${title} body`);

  // The Active switch input is visually covered by its styled indicator, so
  // toggle it via its label text rather than the input element.
  const activeSwitch = form.locator('input[name="active"][role="switch"]');
  if (!(await activeSwitch.isChecked())) {
    await form.getByText('Active', { exact: true }).click();
  }
  await expect(activeSwitch).toBeChecked();

  await form.getByRole('button', { name: 'Submit' }).click();

  // Wait until the new announcement is listed in the admin table.
  await expect(
    page.getByRole('heading', { name: /Admin Portal/i }),
  ).toBeVisible();
};

// The banner dismiss ("Mark as seen") button is overlaid by the alert
// container, so a normal click is intercepted. Dispatch a DOM click on the
// button at the given index instead.
const dismissBannerByIndex = async (page: Page, index: number) => {
  await page.evaluate(i => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        'button[aria-label="Mark as seen"]',
      ),
    );
    buttons[i]?.click();
  }, index);
};

const bannerDismissButtons = (page: Page) =>
  page.getByRole('button', { name: 'Mark as seen' });

test('dismissing one announcement banner leaves the others visible', async ({
  page,
}) => {
  await signInAsGuest(page);

  // Seed two active announcements (created oldest -> newest).
  await createActiveAnnouncement(page, 'Announcement A');
  await createActiveAnnouncement(page, 'Announcement B');

  // On the home page both banners should render (NewAnnouncementBanner max=2).
  await page.goto('/');
  await expect(bannerDismissButtons(page)).toHaveCount(2);

  // Each banner is a bui-Alert container; assert on the whole banner area.
  const bannerAlerts = page.locator('[class*="bui-Alert"]', {
    has: page.getByRole('button', { name: 'Mark as seen' }),
  });
  await expect(bannerAlerts.filter({ hasText: 'Announcement A' })).toHaveCount(
    1,
  );
  await expect(bannerAlerts.filter({ hasText: 'Announcement B' })).toHaveCount(
    1,
  );

  // Dismiss the newer banner (rendered first). Previously this also hid the
  // older banner via the shared lastSeenDate; now each is dismissed by id.
  await dismissBannerByIndex(page, 0);

  // Exactly one banner remains, and it is the older Announcement A.
  await expect(bannerDismissButtons(page)).toHaveCount(1);
  await expect(bannerAlerts.filter({ hasText: 'Announcement A' })).toHaveCount(
    1,
  );
  await expect(bannerAlerts.filter({ hasText: 'Announcement B' })).toHaveCount(
    0,
  );

  // The dismissed state persists across a reload.
  await page.reload();
  await expect(bannerDismissButtons(page)).toHaveCount(1);
  await expect(bannerAlerts.filter({ hasText: 'Announcement A' })).toHaveCount(
    1,
  );
  await expect(bannerAlerts.filter({ hasText: 'Announcement B' })).toHaveCount(
    0,
  );
});
