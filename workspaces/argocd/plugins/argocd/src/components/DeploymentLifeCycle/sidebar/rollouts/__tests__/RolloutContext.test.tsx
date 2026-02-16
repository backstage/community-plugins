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

import { render, screen, renderHook } from '@testing-library/react';

import {
  mockQuarkusApplication,
  mockEntity,
} from '../../../../../../dev/__data__';
import { mockArgoResources } from '../../../../../../dev/__data__/argoRolloutsObjects';
import { useArgocdRollouts } from '../../../../../hooks/useArgoRollouts';
import { ArgoResourcesProvider, useArgoResources } from '../RolloutContext';

jest.mock('../../../../../hooks/useArgoRollouts', () => ({
  useArgocdRollouts: jest.fn(),
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: mockEntity,
  }),
}));

const MockComponent = () => {
  const { rollouts } = useArgoResources();

  return <div data-testid="rollouts">{rollouts.length}</div>;
};

describe('ArgoResourcesProvider', () => {
  beforeEach(() => {
    (useArgocdRollouts as jest.Mock).mockReturnValue(mockArgoResources);
  });

  it('should provide rollouts to the context', () => {
    render(
      <ArgoResourcesProvider application={mockQuarkusApplication}>
        <MockComponent />
      </ArgoResourcesProvider>,
    );

    expect(screen.getByTestId('rollouts').textContent).toBe('2');
  });

  it('should throw an error if useArgoResources is used outside of the provider', () => {
    expect(() =>
      renderHook(() => useArgoResources(), {
        wrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
      }),
    ).toThrow(
      new Error(
        'useArgoResources must be used within an ArgoResourcesProvider',
      ),
    );
  });
});
