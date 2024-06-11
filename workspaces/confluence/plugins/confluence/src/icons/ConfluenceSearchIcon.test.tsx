import React from 'react';
import { render } from '@testing-library/react';
import { ConfluenceSearchIcon } from './ConfluenceSearchIcon';

describe('ConfluenceSearchIcon', () => {
  it('renders the confluence logo', () => {
    const { container } = render(<ConfluenceSearchIcon />);
    expect(container.firstChild).toBeInTheDocument();
    const svgElement = container.querySelector('svg');

    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('height', '20px');
    expect(svgElement).toHaveAttribute('width', '20px');
  });
});
