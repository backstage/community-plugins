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
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { IconPicker } from './IconPicker';

const theme = createTheme();

function renderPicker(
  props: Partial<React.ComponentProps<typeof IconPicker>> = {},
) {
  const onChange = jest.fn();
  const result = render(
    <ThemeProvider theme={theme}>
      <IconPicker value="" onChange={onChange} {...props} />
    </ThemeProvider>,
  );
  return { ...result, onChange };
}

describe('IconPicker', () => {
  it('renders a combobox with the default label', () => {
    renderPicker();
    expect(screen.getByRole('combobox', { name: 'Icon' })).toBeInTheDocument();
  });

  it('renders with a custom label', () => {
    renderPicker({ label: 'Lane Icon' });
    expect(
      screen.getByRole('combobox', { name: 'Lane Icon' }),
    ).toBeInTheDocument();
  });

  it('shows icon options when opened', () => {
    renderPicker();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('rocket')).toBeInTheDocument();
    expect(within(listbox).getByText('code')).toBeInTheDocument();
    expect(within(listbox).getByText('search')).toBeInTheDocument();
  });

  it('calls onChange when an icon is selected', () => {
    const { onChange } = renderPicker();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('code'));
    expect(onChange).toHaveBeenCalledWith('code');
  });
});
