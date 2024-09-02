import React from 'react';

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
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <>{children}</>
        ),
      }),
    ).toThrow(
      new Error(
        'useArgoResources must be used within an ArgoResourcesProvider',
      ),
    );
  });
});
