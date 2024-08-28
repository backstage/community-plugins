import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesKebabMenuOptions } from '../ResourcesKebabMenuOptions';

describe('ResourcesKebabMenuOptions Component', () => {
  test('should render the kebab menu icon button', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    expect(kebabButton).toBeInTheDocument();
  });

  test('should opens the menu when kebab icon is clicked', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(kebabButton);

    expect(screen.getByRole('menu')).toBeVisible();
  });

  test('should renders the correct number of menu items', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(kebabButton);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
  });
});
