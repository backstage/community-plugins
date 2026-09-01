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
import { render } from '@testing-library/react';

import { TopologyEntityContent } from './TopologyEntityContent';

jest.mock('./TopologyComponent', () => ({
  TopologyComponent: () => <div className="pf-ri__topology">topology</div>,
}));

describe('TopologyEntityContent', () => {
  it('wraps Topology in FullPage so the NFS outlet has a definite height', () => {
    const { getByText, container } = render(<TopologyEntityContent />);
    const topology = getByText('topology');
    expect(topology).toHaveClass('pf-ri__topology');
    expect(
      container.querySelector('.bui-FullPage') ?? topology.parentElement,
    ).toContainElement(topology);
    expect(topology.parentElement).not.toBe(container);
  });
});
