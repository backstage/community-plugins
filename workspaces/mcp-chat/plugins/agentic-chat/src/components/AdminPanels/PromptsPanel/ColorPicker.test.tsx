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
import { ColorPicker } from './ColorPicker';

const theme = createTheme();

function renderPicker(value?: string) {
  const onChange = jest.fn();
  const result = render(
    <ThemeProvider theme={theme}>
      <ColorPicker value={value} onChange={onChange} />
    </ThemeProvider>,
  );
  return { ...result, onChange };
}

describe('ColorPicker', () => {
  it('renders color text field with current value', () => {
    renderPicker('#d32f2f');
    const input = screen.getByLabelText('Color') as HTMLInputElement;
    expect(input.value).toBe('#d32f2f');
  });

  it('renders preset color swatch buttons', () => {
    renderPicker();
    expect(screen.getByLabelText('Select color #1976d2')).toBeInTheDocument();
    expect(screen.getByLabelText('Select color #388e3c')).toBeInTheDocument();
    expect(screen.getByLabelText('Select color #d32f2f')).toBeInTheDocument();
  });

  it('calls onChange when a swatch is clicked', () => {
    const { onChange } = renderPicker();
    fireEvent.click(screen.getByLabelText('Select color #388e3c'));
    expect(onChange).toHaveBeenCalledWith('#388e3c');
  });

  it('calls onChange when typing a hex value', () => {
    const { onChange } = renderPicker('#1976d2');
    const input = screen.getByLabelText('Color');
    fireEvent.change(input, { target: { value: '#ff5722' } });
    expect(onChange).toHaveBeenCalledWith('#ff5722');
  });
});
