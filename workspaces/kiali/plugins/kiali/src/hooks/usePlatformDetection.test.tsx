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

import { render, screen, waitFor } from '@testing-library/react';
import { usePlatformDetection } from './usePlatformDetection';

const PlatformProbe = () => {
  const isOpenShift = usePlatformDetection();
  return <div data-testid="platform">{isOpenShift ? 'openshift' : 'rhdh'}</div>;
};

describe('usePlatformDetection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Ensure we don't leak across tests
    delete (window as any).SERVER_FLAGS;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    delete (window as any).SERVER_FLAGS;
    jest.useRealTimers();
  });

  it('defaults to RHDH/Backstage when there are no OpenShift console signals', () => {
    render(<PlatformProbe />);
    expect(screen.getByTestId('platform')).toHaveTextContent('rhdh');

    // Even after the retry loop, should remain false
    jest.advanceTimersByTime(12_000);
    expect(screen.getByTestId('platform')).toHaveTextContent('rhdh');
  });

  it('detects OpenShift Console when window.SERVER_FLAGS is present', async () => {
    (window as any).SERVER_FLAGS = { test: true };

    render(<PlatformProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('platform')).toHaveTextContent('openshift');
    });
  });

  it('does not treat PatternFly masthead/header classes as OpenShift Console (avoid false positives in RHDH)', () => {
    // RHDH can render PF masthead too. This should NOT trip OpenShift detection.
    const masthead = document.createElement('div');
    masthead.className = 'pf-v6-c-masthead';
    document.body.appendChild(masthead);

    render(<PlatformProbe />);
    expect(screen.getByTestId('platform')).toHaveTextContent('rhdh');

    jest.advanceTimersByTime(12_000);
    expect(screen.getByTestId('platform')).toHaveTextContent('rhdh');
  });
});
