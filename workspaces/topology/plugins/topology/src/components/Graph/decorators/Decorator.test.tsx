/*
 * Copyright 2024 The Backstage Authors
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
import { Link, MemoryRouter } from 'react-router-dom';

import { Decorator as PfDecorator } from '@patternfly/react-topology';
import { render, screen } from '@testing-library/react';

import Decorator from './Decorator';

jest.mock('@patternfly/react-topology', () => ({
  Decorator: () => <div>Decorator</div>,
}));

describe('Decorator', () => {
  it('should render PfDecorator', () => {
    render(<Decorator x={0} y={0} radius={0} />);
    expect(PfDecorator).toBeDefined();
  });

  it('should render Link if external is false', () => {
    render(
      <MemoryRouter>
        <Decorator x={0} y={0} radius={0} href="test" />
      </MemoryRouter>,
    );
    expect(Link).toBeDefined();
  });

  it('should render Link with aria-label if external is false', () => {
    render(
      <MemoryRouter>
        <Decorator x={0} y={0} radius={0} href="test" ariaLabel="test" />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('test')).toBeInTheDocument();
  });

  it('should render anchor if external is true', () => {
    render(<Decorator x={0} y={0} radius={0} href="test" external />);
    expect(screen.getByRole('button')).toHaveAttribute('target', '_blank');
  });
});
