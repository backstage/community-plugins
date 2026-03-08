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
import { AdminSection } from './AdminSection';

const theme = createTheme();

function renderSection(
  props: Partial<React.ComponentProps<typeof AdminSection>> = {},
) {
  const defaults: React.ComponentProps<typeof AdminSection> = {
    title: 'Test Section',
    source: 'default',
    saving: false,
    error: null,
    onSave: jest.fn(),
    onReset: jest.fn(),
    children: <div data-testid="child">child content</div>,
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <AdminSection {...defaults} />
    </ThemeProvider>,
  );
}

describe('AdminSection', () => {
  it('renders title and children', () => {
    renderSection({ title: 'My Title' });
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    renderSection({ description: 'A helpful description' });
    expect(screen.getByText('A helpful description')).toBeInTheDocument();
  });

  it('shows Customized chip when source is database', () => {
    renderSection({ source: 'database' });
    expect(screen.getByText('Customized')).toBeInTheDocument();
  });

  it('hides Customized chip when source is default', () => {
    renderSection({ source: 'default' });
    expect(screen.queryByText('Customized')).not.toBeInTheDocument();
  });

  it('disables Reset when source is default', () => {
    renderSection({ source: 'default' });
    expect(screen.getByText('Reset').closest('button')).toBeDisabled();
  });

  it('enables Reset when source is database', () => {
    renderSection({ source: 'database' });
    expect(screen.getByText('Reset').closest('button')).not.toBeDisabled();
  });

  it('calls onSave when Save is clicked', () => {
    const onSave = jest.fn();
    renderSection({ onSave });
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when Reset is clicked', () => {
    const onReset = jest.fn();
    renderSection({ source: 'database', onReset });
    fireEvent.click(screen.getByText('Reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('disables Save while saving', () => {
    renderSection({ saving: true });
    expect(screen.getByText('Save').closest('button')).toBeDisabled();
  });

  it('shows error alert when error is set', () => {
    renderSection({ error: 'Something went wrong' });
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not show error alert when error is null', () => {
    renderSection({ error: null });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
