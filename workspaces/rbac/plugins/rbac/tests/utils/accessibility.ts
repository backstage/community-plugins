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
import AxeBuilder from '@axe-core/playwright';
import { expect, Page, TestInfo } from '@playwright/test';

export async function runAccessibilityTests(
  page: Page,
  testInfo?: TestInfo,
  attachName = 'accessibility-scan-results.json',
  options?: {
    skipViolationsAssert?: boolean;
  },
) {
  const accessibilityScanResults = await new AxeBuilder({
    page: page as any,
  })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  if (testInfo) {
    await testInfo.attach(attachName, {
      body: JSON.stringify(accessibilityScanResults, null, 2),
      contentType: 'application/json',
    });
  }

  if (options?.skipViolationsAssert) {
    expect(
      accessibilityScanResults.violations,
      'Accessibility violations found',
    ).toEqual([]);
  }
}
