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
import { BaseNode } from '@patternfly/react-topology';
import { render } from '@testing-library/react';

import {
  workloadNode,
  workloadNode2,
} from '../../../__fixtures__/workloadNodeData';
import { mockUseTranslation } from '../../../test-utils/mockTranslations';
import TopologyDetailsTabPanel from './TopologyDetailsTabPanel';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => 'en',
}));

describe('TopologyDetailsTabPanel', () => {
  it('Should render workload node details', () => {
    const { queryByTestId } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('details-tab')).not.toBeNull();
  });

  it('Should show pod ring if pods data is available', () => {
    const { rerender, queryByRole } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(
      queryByRole('img', {
        name: /1 pod/i,
      }),
    ).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    expect(
      queryByRole('img', {
        name: /1 pods/i,
      }),
    ).toBeNull();
  });

  it('Should show labels if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('label-list')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no labels/i);
  });

  it('Should show annotations if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('annotation-list')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no annotations/i);
  });

  it('Should show owners if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('owner-list')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no owner/i);
  });

  it('Should show more details if workload is a deployment', () => {
    const { queryByTestId, rerender } = render(
      <TopologyDetailsTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('deployment-details')).not.toBeNull();
    rerender(<TopologyDetailsTabPanel node={workloadNode2 as BaseNode} />);
    expect(queryByTestId('deployment-details')).toBeNull();
  });
});
