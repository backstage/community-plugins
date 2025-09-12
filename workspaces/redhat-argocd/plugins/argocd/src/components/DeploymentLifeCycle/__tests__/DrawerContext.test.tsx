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
import type { ReactNode } from 'react';
import { DrawerProvider, useDrawerContext } from '../DrawerContext';
import { screen, render, renderHook } from '@testing-library/react';
import { mockApplication } from '../../../../dev/__data__';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';

const MockComponent = () => {
  const { application, appHistory, latestRevision } = useDrawerContext();

  if (!application) {
    return null;
  }
  return (
    <>
      <div>{application?.metadata?.name}</div>
      <div>{`History: ${appHistory.length}`}</div>
      <div>{`LatestRevision: ${latestRevision.id}`}</div>
    </>
  );
};

describe('DrawerContext', () => {
  it('should not render the mock element if application is missing', () => {
    const { container } = render(
      <DrawerProvider
        application={null as unknown as Application}
        revisions={[]}
      >
        <MockComponent />
      </DrawerProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render the mock element with correct data', () => {
    render(
      <DrawerProvider application={mockApplication} revisions={[]}>
        <MockComponent />
      </DrawerProvider>,
    );

    expect(screen.queryByText('quarkus-app-dev')).toBeInTheDocument();
    expect(screen.queryByText('History: 2')).toBeInTheDocument();
    expect(screen.queryByText('LatestRevision: 1')).toBeInTheDocument();
  });

  it('should throw an error if useDrawerContext is used outside of the provider', () => {
    expect(() =>
      renderHook(() => useDrawerContext(), {
        wrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
      }),
    ).toThrow(
      new Error('useDrawerContext must be used within an DrawerProvider'),
    );
  });
});
