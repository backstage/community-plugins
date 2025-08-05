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
import { LinkProps } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';

import {
  taskRunWithResults,
  taskRunWithSBOMResult,
  taskRunWithSBOMResultExternalLink,
} from '../../../__fixtures__/taskRunData';
import PipelineRunSBOMLink from '../PipelineRunSBOMLink';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Link: (props: LinkProps) => (
      <a href={props.to} data-test={props.to}>
        {props.children}
      </a>
    ),
  };
});

describe('PipelineRunSBOMLInk', () => {
  it('should render the icon space holder', () => {
    render(<PipelineRunSBOMLink sbomTaskRun={undefined} />);

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the icon space holder if the taskrun passed is not a valid sbomTaskrun', () => {
    render(<PipelineRunSBOMLink sbomTaskRun={taskRunWithResults} />);

    expect(screen.queryByTestId('icon-space-holder')).toBeInTheDocument();
  });

  it('should render the internal logs link for a sbom Taskrun', () => {
    render(<PipelineRunSBOMLink sbomTaskRun={taskRunWithSBOMResult} />);
    expect(screen.queryByTestId('internal-sbom-link')).toBeInTheDocument();
  });

  it('should render the external logs link for a sbom Taskrun', () => {
    render(
      <PipelineRunSBOMLink sbomTaskRun={taskRunWithSBOMResultExternalLink} />,
    );

    expect(screen.queryByTestId('external-sbom-link')).toBeInTheDocument();
  });
});
