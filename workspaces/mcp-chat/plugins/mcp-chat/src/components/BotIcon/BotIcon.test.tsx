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

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BotIcon, BotIconComponent } from './BotIcon';

describe('BotIcon', () => {
  it('renders with default props', () => {
    const { container } = render(<BotIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '30');
    expect(svg).toHaveAttribute('height', '30');
    expect(svg).toHaveAttribute('fill', '#333');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('renders with custom size', () => {
    const { container } = render(<BotIcon size={50} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '50');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('renders with custom color', () => {
    const { container } = render(<BotIcon color="#ff0000" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', '#ff0000');
  });

  it('forwards additional props to the svg element', () => {
    render(<BotIcon data-testid="custom-bot-icon" className="custom-class" />);

    const svg = screen.getByTestId('custom-bot-icon');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('custom-class');
  });

  it('contains the correct path and rect elements', () => {
    const { container } = render(<BotIcon />);

    const path = container.querySelector('path');
    const rects = container.querySelectorAll('rect');

    expect(path).toBeInTheDocument();
    expect(rects).toHaveLength(2);

    expect(path).toHaveAttribute(
      'd',
      expect.stringContaining('M71,21.2V5H58v14H41V5H29v15'),
    );

    expect(rects[0]).toHaveAttribute('x', '31');
    expect(rects[0]).toHaveAttribute('y', '43');
    expect(rects[0]).toHaveAttribute('width', '12');
    expect(rects[0]).toHaveAttribute('height', '12');

    expect(rects[1]).toHaveAttribute('x', '55');
    expect(rects[1]).toHaveAttribute('y', '43');
    expect(rects[1]).toHaveAttribute('width', '12');
    expect(rects[1]).toHaveAttribute('height', '12');
  });

  it('has correct namespace and viewBox attributes', () => {
    const { container } = render(<BotIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });
});

describe('BotIconComponent', () => {
  it('renders with default props', () => {
    const { container } = render(<BotIconComponent />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24'); // medium fontSize maps to 24
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('fill', '#B5B5B5'); // inherit color maps to #B5B5B5
  });

  it('maps fontSize to correct sizes', () => {
    const { rerender, container } = render(
      <BotIconComponent fontSize="small" />,
    );
    let svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');

    rerender(<BotIconComponent fontSize="medium" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');

    rerender(<BotIconComponent fontSize="large" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '35');
    expect(svg).toHaveAttribute('height', '35');

    rerender(<BotIconComponent fontSize="inherit" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('handles numeric fontSize by defaulting to medium', () => {
    const { container } = render(<BotIconComponent fontSize={16 as any} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('handles unknown fontSize by defaulting to medium', () => {
    const { container } = render(
      <BotIconComponent fontSize={'unknown' as any} />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('maps color correctly', () => {
    const { rerender, container } = render(
      <BotIconComponent color="inherit" />,
    );
    let svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', '#B5B5B5');

    rerender(<BotIconComponent color="primary" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'primary');

    rerender(<BotIconComponent color="secondary" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'secondary');
  });

  it('forwards additional props to BotIcon', () => {
    render(
      <BotIconComponent
        data-testid="backstage-bot-icon"
        className="backstage-class"
      />,
    );

    const svg = screen.getByTestId('backstage-bot-icon');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('backstage-class');
  });

  it('filters out SvgIconProps that should not be passed to BotIcon', () => {
    render(
      <BotIconComponent
        fontSize="large"
        color="primary"
        titleAccess="Bot Icon"
        htmlColor="#blue"
        inheritViewBox
        shapeRendering="auto"
        data-testid="filtered-props-icon"
      />,
    );

    const svg = screen.getByTestId('filtered-props-icon');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '35');
    expect(svg).toHaveAttribute('fill', 'primary');

    expect(svg).not.toHaveAttribute('titleAccess');
    expect(svg).not.toHaveAttribute('htmlColor');
    expect(svg).not.toHaveAttribute('inheritViewBox');
    expect(svg).not.toHaveAttribute('shapeRendering');
    expect(svg).not.toHaveAttribute('fontSize');
  });

  it('maintains SVG structure and content', () => {
    const { container } = render(<BotIconComponent />);

    const path = container.querySelector('path');
    const rects = container.querySelectorAll('rect');

    expect(path).toBeInTheDocument();
    expect(rects).toHaveLength(2);

    expect(path).toHaveAttribute(
      'd',
      expect.stringContaining('M71,21.2V5H58v14H41V5H29v15'),
    );
  });
});
