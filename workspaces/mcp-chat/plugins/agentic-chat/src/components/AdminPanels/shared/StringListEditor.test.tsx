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
import { StringListEditor } from './StringListEditor';

const theme = createTheme();

function renderEditor(
  props: Partial<React.ComponentProps<typeof StringListEditor>> = {},
) {
  const defaults: React.ComponentProps<typeof StringListEditor> = {
    items: [],
    onChange: jest.fn(),
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <StringListEditor {...defaults} />
    </ThemeProvider>,
  );
}

describe('StringListEditor', () => {
  it('renders existing items as chips', () => {
    renderEditor({ items: ['alpha', 'beta'] });
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    renderEditor({ label: 'Shield IDs' });
    expect(screen.getByText('Shield IDs')).toBeInTheDocument();
  });

  it('adds an item when the add button is clicked', () => {
    const onChange = jest.fn();
    renderEditor({ items: ['existing'], onChange });

    const input = screen.getByPlaceholderText('Add an item...');
    fireEvent.change(input, { target: { value: 'new-item' } });
    fireEvent.click(screen.getByLabelText('add item'));

    expect(onChange).toHaveBeenCalledWith(['existing', 'new-item']);
  });

  it('adds an item on Enter key', () => {
    const onChange = jest.fn();
    renderEditor({ items: [], onChange });

    const input = screen.getByPlaceholderText('Add an item...');
    fireEvent.change(input, { target: { value: 'enter-item' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['enter-item']);
  });

  it('does not add duplicate items', () => {
    const onChange = jest.fn();
    renderEditor({ items: ['duplicate'], onChange });

    const input = screen.getByPlaceholderText('Add an item...');
    fireEvent.change(input, { target: { value: 'duplicate' } });
    fireEvent.click(screen.getByLabelText('add item'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not add empty items', () => {
    const onChange = jest.fn();
    renderEditor({ items: [], onChange });

    fireEvent.click(screen.getByLabelText('add item'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes an item when chip delete is clicked', () => {
    const onChange = jest.fn();
    renderEditor({ items: ['a', 'b', 'c'], onChange });

    const deleteButtons = screen.getAllByTestId('CancelIcon');
    fireEvent.click(deleteButtons[1]);

    expect(onChange).toHaveBeenCalledWith(['a', 'c']);
  });

  it('disables input and add button when disabled', () => {
    renderEditor({ items: [], disabled: true });

    const input = screen.getByPlaceholderText('Add an item...');
    expect(input).toBeDisabled();
    expect(screen.getByLabelText('add item')).toBeDisabled();
  });
});
