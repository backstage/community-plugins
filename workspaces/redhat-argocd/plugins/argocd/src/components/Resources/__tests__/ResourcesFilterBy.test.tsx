import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ResourcesFilterBy } from '../ResourcesFilterBy';
import { HealthStatus } from '../../../types';

describe('ResourcesFilterBy Component', () => {
  const mockSetFilterValue = jest.fn();

  beforeEach(() => {
    mockSetFilterValue.mockClear();
  });

  it('should renders the filter button with default label "Filter by"', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    expect(button).toBeInTheDocument();
  });

  it('should opens the filter menu when the filter button is clicked', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    fireEvent.click(button);

    // Check if "All" option is visible
    const allOption = screen.getByRole('menuitem', { name: /All/i });
    expect(allOption).toBeInTheDocument();
  });

  it('should render all menu options including "All" and HealthStatus options', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    fireEvent.click(button);

    // Check for "All" option
    const allOption = screen.getByRole('menuitem', { name: /All/i });
    expect(allOption).toBeInTheDocument();

    // Check for each HealthStatus option
    Object.values(HealthStatus).forEach(status => {
      const statusOption = screen.getByRole('menuitem', { name: status });
      expect(statusOption).toBeInTheDocument();
    });
  });

  it('should selects "All" option, updates label, and calls setFilterValue with "All"', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    fireEvent.click(button);

    const allOption = screen.getByRole('menuitem', { name: /All/i });
    fireEvent.click(allOption);

    // Button label should now be "All"
    const updatedButton = screen.getByRole('button', { name: /All/i });
    expect(updatedButton).toBeInTheDocument();

    // setFilterValue should have been called with "All"
    expect(mockSetFilterValue).toHaveBeenCalledWith('All');
  });

  it('selects a HealthStatus option, updates label, and calls setFilterValue with the selected status', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    fireEvent.click(button);

    const healthStatus = Object.values(HealthStatus)[0];
    const healthOption = screen.getByRole('menuitem', { name: healthStatus });
    fireEvent.click(healthOption);

    // Button label should now be the selected HealthStatus
    const updatedButton = screen.getByRole('button', {
      name: new RegExp(healthStatus, 'i'),
    });
    expect(updatedButton).toBeInTheDocument();

    // setFilterValue should have been called with the corresponding key, assuming 'HEALTHY'
    const selectedKey = Object.keys(HealthStatus).find(
      key => HealthStatus[key as keyof typeof HealthStatus] === healthStatus,
    );
    expect(selectedKey).toBeDefined();
    expect(mockSetFilterValue).toHaveBeenCalledWith(selectedKey);
  });

  it('should closes the dropdown menu after selecting an option', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    fireEvent.click(button);

    const allOption = screen.getByRole('menuitem', { name: /All/i });
    fireEvent.click(allOption);

    // The menu should no longer be visible
    expect(allOption).not.toBeVisible();
  });

  it('ensures only one option is selected at a time', () => {
    render(<ResourcesFilterBy setFilterValue={mockSetFilterValue} />);

    const button = screen.getByRole('button', { name: /Filter by/i });
    fireEvent.click(button);

    const allOption = screen.getByRole('menuitem', { name: /All/i });
    fireEvent.click(allOption);

    // Re-open the menu
    fireEvent.click(screen.getByRole('button', { name: /All/i }));
    expect(allOption).not.toHaveAttribute('aria-selected', 'true');
  });
});
