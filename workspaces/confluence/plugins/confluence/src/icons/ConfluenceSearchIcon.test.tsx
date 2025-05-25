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
