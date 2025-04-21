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
import { act } from 'react';

import { render, screen } from '@testing-library/react';

import { ReplicaSet } from '../../../../../../types/resources';
import ProgressBar from '../ProgressBar';

jest.mock('@patternfly/react-core', () => ({
  Progress: jest.fn(({ value }) => <div data-testid="progress">{value}</div>),
}));

describe('ProgressBar', () => {
  jest.setTimeout(10000);
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  const mockRevision: ReplicaSet = {
    metadata: {
      name: 'revision-name',
    },
  };

  it('should render with initial value of 0', () => {
    render(
      <ProgressBar revision={mockRevision} percentage={50} duration={2000} />,
    );

    const progressElement = screen.getByTestId('progress');
    expect(progressElement).toHaveTextContent('0');
  });

  it('should render with safe duration value', () => {
    render(
      <ProgressBar revision={mockRevision} percentage={50} duration={0} />,
    );

    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByTestId('progress')).toHaveTextContent('50');
  });

  it('should render with default duration value', () => {
    render(
      <ProgressBar
        revision={mockRevision}
        percentage={100}
        duration={undefined}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const progressElement = screen.getByTestId('progress');
    expect(progressElement).toHaveTextContent('0');
    expect(screen.getByTestId('progress')).toHaveTextContent('100');
  });
  it('should update value gradually and stop at the specified percentage', () => {
    render(
      <ProgressBar revision={mockRevision} percentage={50} duration={2000} />,
    );
    // Advance timer and check progress updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByTestId('progress')).not.toHaveTextContent('0');

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.getByTestId('progress')).toHaveTextContent('50');
  });

  it('should not update value if the percentage is the same as currentValue', () => {
    render(
      <ProgressBar revision={mockRevision} percentage={0} duration={2000} />,
    );

    const progressElement = screen.getByTestId('progress');
    expect(progressElement).toHaveTextContent('0');
  });

  it('should clamp the value between 0 and 100', () => {
    render(
      <ProgressBar revision={mockRevision} percentage={150} duration={2000} />,
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId('progress')).toHaveTextContent('100');
  });

  it('should decrement the value gradually', () => {
    const { rerender } = render(
      <ProgressBar revision={mockRevision} percentage={50} duration={100} />,
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('progress')).toHaveTextContent('50');

    rerender(
      <ProgressBar revision={mockRevision} percentage={0} duration={100} />,
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('progress')).toHaveTextContent('0');
  });

  it('should stop updating when component unmounts', () => {
    const { unmount } = render(
      <ProgressBar revision={mockRevision} percentage={50} duration={2000} />,
    );

    // start the interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // it should clear the interval
    unmount();

    expect(screen.queryByTestId('progress')).toBeNull();
  });
});
