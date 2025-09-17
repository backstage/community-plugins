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

import { mockUseTranslation } from '../../../test-utils/mockTranslations';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

import {
  workloadNode,
  workloadNode2,
  workloadNode3,
  workloadNode4,
  workloadNode5,
  workloadNodeWtknRes,
  workloadNodeWtknRes2,
} from '../../../__fixtures__/workloadNodeData';
import TopologyResourcesTabPanel from './TopologyResourcesTabPanel';

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: () => (_theme: any) => {
    return {
      ok: 'ok',
    };
  },
}));

describe('TopologyResourcesTabPanel', () => {
  it('Should render workload resources', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('resources-tab')).not.toBeNull();
  });

  it('Should show pods if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('pod-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no pods found for this resource/i);
  });

  it('Should show latest 3 pods if more than 3 are available', () => {
    const { queryByTestId, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('pod-list')).not.toBeNull();
    expect(queryByTestId('res-show-count')).toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode5 as BaseNode} />);
    expect(queryByTestId('pod-list')).not.toBeNull();
    expect(queryByTestId('res-show-count')).not.toBeNull();
  });

  it('Should show services if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('service-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no services found for this resource/i);
  });

  it('Should show ingresses if available and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('ingress-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    getByText(/no ingresses found for this resource/i);
  });

  it('Should show jobs section only for cron-job', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('job-list')).toBeNull();
  });

  it('Should show jobs if available for cron-job and empty state otherwise', () => {
    const { queryByTestId, getByText, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode3 as BaseNode} />,
    );
    expect(queryByTestId('job-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode4 as BaseNode} />);
    getByText(/no jobs found for this resource/i);
  });

  it('Should show routes only if available otherwise should not show it', () => {
    const { queryByTestId, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('routes-list')).not.toBeNull();
    rerender(<TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />);
    expect(queryByTestId('routes-list')).toBeNull();
  });

  it('Should show routes and ingresses both if available', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('routes-list')).not.toBeNull();
    expect(queryByTestId('ingress-list')).not.toBeNull();
  });

  it('Should show empty state for ingresses if none of routes and ingresses are associated', () => {
    const { queryByTestId, getByText } = render(
      <TopologyResourcesTabPanel node={workloadNode2 as BaseNode} />,
    );
    expect(queryByTestId('routes-list')).toBeNull();
    expect(queryByTestId('ingress-list')).not.toBeNull();
    getByText(/no ingresses found for this resource/i);
  });

  it('Should show PipelineRuns in sidepanel', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNodeWtknRes as BaseNode} />,
    );
    expect(queryByTestId('plr-list')).not.toBeNull();
  });

  it('Should show only 3 latest PipelineRuns if more are available in sidepanel', () => {
    const { queryByTestId, rerender } = render(
      <TopologyResourcesTabPanel node={workloadNodeWtknRes as BaseNode} />,
    );
    expect(queryByTestId('plr-list')).not.toBeNull();
    expect(queryByTestId('res-show-count')).toBeNull();

    rerender(
      <TopologyResourcesTabPanel node={workloadNodeWtknRes2 as BaseNode} />,
    );
    expect(queryByTestId('plr-list')).not.toBeNull();
    expect(queryByTestId('res-show-count')).not.toBeNull();
  });

  it('Should not show PipelineRuns in sidepanel if pipelinesData is not available', () => {
    const { queryByTestId } = render(
      <TopologyResourcesTabPanel node={workloadNode as BaseNode} />,
    );
    expect(queryByTestId('plr-list')).toBeNull();
  });
});
