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
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ServerItemPicker } from './ServerItemPicker';

const theme = createTheme();

const defaultProps = {
  selected: [] as string[],
  onChange: jest.fn(),
  serverItems: ['shield-a', 'shield-b', 'shield-c'],
  serverLoading: false,
  serverError: null,
  onRefresh: jest.fn(),
  label: 'Test Items',
  itemLabel: 'items',
};

function renderPicker(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(
    <ThemeProvider theme={theme}>
      <ServerItemPicker {...props} />
    </ThemeProvider>,
  );
}

describe('ServerItemPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders server items as chips', () => {
    renderPicker();
    expect(screen.getByText('shield-a')).toBeInTheDocument();
    expect(screen.getByText('shield-b')).toBeInTheDocument();
    expect(screen.getByText('shield-c')).toBeInTheDocument();
  });

  it('shows count of available items', () => {
    renderPicker();
    expect(screen.getByText('3 available on server')).toBeInTheDocument();
  });

  it('toggles item on click', () => {
    const onChange = jest.fn();
    renderPicker({ onChange });
    fireEvent.click(screen.getByText('shield-a'));
    expect(onChange).toHaveBeenCalledWith(['shield-a']);
  });

  it('removes item when already selected', () => {
    const onChange = jest.fn();
    renderPicker({ onChange, selected: ['shield-a', 'shield-b'] });
    fireEvent.click(screen.getByText('shield-a'));
    expect(onChange).toHaveBeenCalledWith(['shield-b']);
  });

  it('shows loading spinner when serverLoading is true', () => {
    renderPicker({ serverLoading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error alert when serverError is set', () => {
    renderPicker({ serverError: 'Connection failed' });
    expect(
      screen.getByText(/Could not discover items: Connection failed/),
    ).toBeInTheDocument();
  });

  it('shows info alert when no server items and no error', () => {
    renderPicker({ serverItems: [] });
    expect(
      screen.getByText(/No items registered on the .* server/),
    ).toBeInTheDocument();
  });

  it('adds custom item via text field', () => {
    const onChange = jest.fn();
    renderPicker({ onChange });
    const input = screen.getByPlaceholderText('Add custom item...');
    fireEvent.change(input, { target: { value: 'my-custom-shield' } });
    fireEvent.click(screen.getByLabelText('add custom item'));
    expect(onChange).toHaveBeenCalledWith(['my-custom-shield']);
  });

  it('shows custom items with warning chip variant', () => {
    renderPicker({ selected: ['custom-item'], serverItems: ['shield-a'] });
    expect(screen.getByText('custom-item')).toBeInTheDocument();
    expect(screen.getByText('Custom (not on server)')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn();
    renderPicker({ onRefresh });
    fireEvent.click(screen.getByLabelText('Refresh items'));
    expect(onRefresh).toHaveBeenCalled();
  });
});
