import React from 'react';

import { render } from '@testing-library/react';

import { AcrDashboardPage } from './AcrDashboardPage';

jest.mock('../useAcrAppData', () => ({
  useAcrAppData: jest.fn().mockReturnValue({ imageName: 'sample/node' }),
}));

jest.mock('../AzureContainerRegistry', () => ({
  AzureContainerRegistry: () => (
    <div data-testid="acr-registry">acr registry</div>
  ),
}));

describe('AcrDashboardPage', () => {
  it('should render AcrDashboardPage', () => {
    const { queryByTestId } = render(<AcrDashboardPage />);
    expect(queryByTestId('acr-registry')).toBeInTheDocument();
  });
});
