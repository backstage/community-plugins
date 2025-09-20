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

import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BotIcon } from './BotIcon';

const mockTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4CAF50' },
    text: { primary: '#333', secondary: '#666' },
    background: { paper: '#fff', default: '#f5f5f5' },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4CAF50' },
    text: { primary: '#fff', secondary: 'rgba(255, 255, 255, 0.7)' },
    background: { paper: '#121212', default: '#000' },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const renderWithTheme = (component: ReactElement, theme = mockTheme) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('BotIcon', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<BotIcon />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders with default size', () => {
      const { container } = renderWithTheme(<BotIcon />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '30');
      expect(icon).toHaveAttribute('height', '30');
    });

    it('renders with default color', () => {
      const { container } = renderWithTheme(<BotIcon />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('fill', '#333');
    });

    it('has correct viewBox', () => {
      const { container } = renderWithTheme(<BotIcon />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('viewBox', '0 0 100 100');
    });
  });

  describe('Props Handling', () => {
    it('accepts custom size prop', () => {
      const { container } = renderWithTheme(<BotIcon size={48} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '48');
      expect(icon).toHaveAttribute('height', '48');
    });

    it('accepts custom color prop', () => {
      const { container } = renderWithTheme(<BotIcon color="#ff0000" />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('fill', '#ff0000');
    });

    it('passes through additional SVG props', () => {
      const { container } = renderWithTheme(
        <BotIcon className="custom-class" />,
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('custom-class');
    });

    it('handles multiple props together', () => {
      const { container } = renderWithTheme(
        <BotIcon size={64} color="#blue" className="test-icon" />,
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '64');
      expect(icon).toHaveAttribute('height', '64');
      expect(icon).toHaveAttribute('fill', '#blue');
      expect(icon).toHaveClass('test-icon');
    });
  });

  describe('Size Variations', () => {
    it('renders small size correctly', () => {
      const { container } = renderWithTheme(<BotIcon size={16} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('height', '16');
    });

    it('renders large size correctly', () => {
      const { container } = renderWithTheme(<BotIcon size={64} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '64');
      expect(icon).toHaveAttribute('height', '64');
    });

    it('maintains aspect ratio', () => {
      const { container } = renderWithTheme(<BotIcon size={32} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '32');
      expect(icon).toHaveAttribute('height', '32');
    });

    it('scales properly with different sizes', () => {
      [12, 24, 48, 96].forEach(size => {
        const { container, unmount } = renderWithTheme(<BotIcon size={size} />);

        const icon = container.querySelector('svg');
        expect(icon).toHaveAttribute('width', `${size}`);
        expect(icon).toHaveAttribute('height', `${size}`);

        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero size gracefully', () => {
      const { container } = renderWithTheme(<BotIcon size={0} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '0');
      expect(icon).toHaveAttribute('height', '0');
    });

    it('handles very large size', () => {
      const { container } = renderWithTheme(<BotIcon size={200} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '200');
      expect(icon).toHaveAttribute('height', '200');
    });

    it('handles negative size gracefully', () => {
      const { container } = renderWithTheme(<BotIcon size={-10} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('adapts to light theme', () => {
      const { container } = renderWithTheme(<BotIcon />, mockTheme);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('adapts to dark theme', () => {
      const { container } = renderWithTheme(<BotIcon />, darkTheme);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('respects theme spacing', () => {
      const { container } = renderWithTheme(<BotIcon />, mockTheme);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('SVG Structure', () => {
    it('contains the correct SVG elements', () => {
      const { container } = renderWithTheme(<BotIcon />);

      const icon = container.querySelector('svg');
      expect(icon?.tagName).toBe('svg');
      expect(icon).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('has proper SVG content', () => {
      const { container } = renderWithTheme(<BotIcon />);

      const icon = container.querySelector('svg');
      const paths = icon?.querySelectorAll('path');
      const rects = icon?.querySelectorAll('rect');

      expect(paths).toHaveLength(1);
      expect(rects).toHaveLength(2);
    });
  });
});
