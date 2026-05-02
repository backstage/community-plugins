/*
 * Copyright 2026 The Backstage Authors
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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CodeBlock } from './CodeBlock';

const theme = createTheme();

const renderCodeBlock = (props: {
  children?: React.ReactNode;
  maxHeight?: string;
}) =>
  render(
    <ThemeProvider theme={theme}>
      <CodeBlock {...props} />
    </ThemeProvider>,
  );

describe('CodeBlock', () => {
  it('renders string children', () => {
    renderCodeBlock({ children: 'console.log("hi")' });
    expect(screen.getByText('console.log("hi")')).toBeInTheDocument();
  });

  it('renders number children', () => {
    renderCodeBlock({ children: 42 });
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders nested element children', () => {
    renderCodeBlock({ children: <span>nested text</span> });
    expect(screen.getByText('nested text')).toBeInTheDocument();
  });

  it('shows copy button with default title', () => {
    renderCodeBlock({ children: 'code' });
    expect(screen.getByTitle('Copy code')).toBeInTheDocument();
  });

  it('copies text to clipboard on click', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(window.navigator, {
      clipboard: { writeText },
    });

    renderCodeBlock({ children: 'copy me' });
    fireEvent.click(screen.getByTitle('Copy code'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy me');
    });
  });

  it('extracts text from array children for copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(window.navigator, {
      clipboard: { writeText },
    });

    renderCodeBlock({
      children: ['hello', ' ', 'world'],
    });
    fireEvent.click(screen.getByTitle('Copy code'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('hello world');
    });
  });

  it('extracts text from nested React elements for copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(window.navigator, {
      clipboard: { writeText },
    });

    renderCodeBlock({
      children: (
        <span>
          <em>deep</em>
        </span>
      ),
    });
    fireEvent.click(screen.getByTitle('Copy code'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('deep');
    });
  });

  it('returns empty string for null/undefined/boolean children on copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(window.navigator, {
      clipboard: { writeText },
    });

    renderCodeBlock({ children: undefined });
    fireEvent.click(screen.getByTitle('Copy code'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('');
    });
  });

  it('shows "Copied!" title after copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(window.navigator, {
      clipboard: { writeText },
    });

    renderCodeBlock({ children: 'code' });
    fireEvent.click(screen.getByTitle('Copy code'));

    await waitFor(() => {
      expect(screen.getByTitle('Copied!')).toBeInTheDocument();
    });
  });

  it('handles clipboard error gracefully', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.assign(window.navigator, {
      clipboard: { writeText },
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderCodeBlock({ children: 'code' });
    fireEvent.click(screen.getByTitle('Copy code'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy text');
    });
    consoleSpy.mockRestore();
  });

  it('renders with no children', () => {
    const { container } = renderCodeBlock({});
    expect(container.querySelector('pre')).toBeInTheDocument();
  });
});
