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
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DeleteConfirmButton } from './DeleteConfirmButton';

const theme = createTheme();

function renderButton(
  props: Partial<React.ComponentProps<typeof DeleteConfirmButton>> = {},
) {
  const onConfirm = jest.fn();
  const result = render(
    <ThemeProvider theme={theme}>
      <DeleteConfirmButton
        confirmLabel="Delete lane?"
        onConfirm={onConfirm}
        {...props}
      />
    </ThemeProvider>,
  );
  return { ...result, onConfirm };
}

describe('DeleteConfirmButton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows delete icon button initially', () => {
    renderButton();
    expect(screen.getByLabelText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Delete lane?')).not.toBeInTheDocument();
  });

  it('shows confirm button on first click', () => {
    renderButton();
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(screen.getByText('Delete lane?')).toBeInTheDocument();
  });

  it('calls onConfirm on second click', () => {
    const { onConfirm } = renderButton();
    fireEvent.click(screen.getByLabelText('Delete'));
    fireEvent.click(screen.getByText('Delete lane?'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not call onConfirm on first click', () => {
    const { onConfirm } = renderButton();
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('auto-dismisses confirmation after timeout', () => {
    renderButton();
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(screen.getByText('Delete lane?')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Delete lane?')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Delete')).toBeInTheDocument();
  });

  it('uses custom tooltip title', () => {
    renderButton({ tooltipTitle: 'Remove item' });
    expect(screen.getByLabelText('Remove item')).toBeInTheDocument();
  });
});
