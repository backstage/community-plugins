import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesSearchBar } from '../ResourcesSearchBar';

describe('ResourcesSearchBar', () => {
  const mockOnChange = jest.fn();
  const mockOnSearchClear = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnSearchClear.mockClear();
  });

  test('should renders the search input field', () => {
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

  test('does not display the clear icon when input is empty', () => {
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

  test('should displays the clear icon when there is text in the input field', () => {
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

  test('should calls onChange handler when typing in the input field', () => {
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

  test('should calls onSearchClear handler when clear icon is clicked', () => {
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
