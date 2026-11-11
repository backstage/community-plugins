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
import { renderTestApp } from '@backstage/frontend-test-utils';
import { screen, within } from '@testing-library/react';
import shortcutsPlugin from './alpha';

describe('shortcuts (new frontend system)', () => {
  it('adds the shortcuts to the app navigation', async () => {
    expect(shortcutsPlugin.id).toBe('shortcuts');

    renderTestApp({ features: [shortcutsPlugin] });

    // Rendering the add button proves the element is in the navigation and
    // the plugin's API resolved; without the API the element would show an
    // error panel instead.
    const nav = await screen.findByRole('navigation');
    expect(await within(nav).findByText('Add Shortcuts')).toBeInTheDocument();
  });
});
