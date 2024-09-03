import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesSearchBar } from '../ResourcesSearchBar';

describe('ResourcesSearchBar Component', () => {
  const mockOnChange = jest.fn();
  const mockOnSearchClear = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnSearchClear.mockClear();
  });

  it('should render the search input field', () => {
    render(
      <ResourcesSearchBar
        value=""
        onChange={mockOnChange}
        onSearchClear={mockOnSearchClear}
      />,
    );

    const input = screen.getByPlaceholderText(/search by kind/i);
    expect(input).toBeInTheDocument();
  });

  it('should not display the clear icon when input is empty', () => {
    render(
      <ResourcesSearchBar
        value=""
        onChange={mockOnChange}
        onSearchClear={mockOnSearchClear}
      />,
    );

    const clearIcon = screen.queryByTestId('clear-search');
    expect(clearIcon).not.toBeVisible();
  });

  it('should display the clear icon when there is text in the input field', () => {
    render(
      <ResourcesSearchBar
        value="search term"
        onChange={mockOnChange}
        onSearchClear={mockOnSearchClear}
      />,
    );

    const clearIcon = screen.getByTestId('clear-search');
    expect(clearIcon).toBeVisible();
  });

  it('should call onChange handler when typing in the input field', () => {
    render(
      <ResourcesSearchBar
        value=""
        onChange={mockOnChange}
        onSearchClear={mockOnSearchClear}
      />,
    );

    const input = screen.getByPlaceholderText(/search by kind/i);
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should call onSearchClear handler when clear icon is clicked', () => {
    render(
      <ResourcesSearchBar
        value="search term"
        onChange={mockOnChange}
        onSearchClear={mockOnSearchClear}
      />,
    );

    const clearIcon = screen.getByTestId('clear-search');
    fireEvent.click(clearIcon);

    expect(mockOnSearchClear).toHaveBeenCalledTimes(1);
    expect(mockOnSearchClear).toHaveBeenCalledWith(expect.any(Object));
  });
});
