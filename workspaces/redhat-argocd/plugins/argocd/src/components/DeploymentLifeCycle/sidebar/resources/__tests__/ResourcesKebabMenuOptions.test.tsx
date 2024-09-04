import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesKebabMenuOptions } from '../ResourcesKebabMenuOptions';

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

  it('should render the correct number of menu items', () => {
    render(<ResourcesKebabMenuOptions />);

    const kebabButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(kebabButton);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
  });
});
