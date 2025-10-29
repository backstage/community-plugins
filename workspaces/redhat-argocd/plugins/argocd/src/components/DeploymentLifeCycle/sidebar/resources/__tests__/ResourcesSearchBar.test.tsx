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

import { ResourcesSearchBar } from '../ResourcesSearchBar';
import { mockUseTranslation } from '../../../../../test-utils/mockTranslations';

jest.mock('../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

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
