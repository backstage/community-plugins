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
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesKebabMenuOptions } from '../ResourcesKebabMenuOptions';
import { mockUseTranslation } from '../../../../../test-utils/mockTranslations';

jest.mock('../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('ResourcesKebabMenuOptions Component', () => {
  it('should render the kebab menu icon button', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    expect(kebabButton).toBeInTheDocument();
  });

  it('should open the menu when kebab icon is clicked', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(kebabButton);

    expect(screen.getByRole('menu')).toBeVisible();
  });

  it('should close the kebab menu when escape key is pressed', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(kebabButton);

    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should render the correct number of menu items', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(kebabButton);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
  });
});
