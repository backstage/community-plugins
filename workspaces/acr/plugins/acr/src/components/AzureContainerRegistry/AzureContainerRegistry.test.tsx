import React from 'react';
import { useAsync } from 'react-use';

import { render } from '@testing-library/react';

import { mockAcrTagsData } from '../../__fixtures__/acrTagsObject';
import { AzureContainerRegistry } from './AzureContainerRegistry';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getTags: jest.fn(),
  }),
}));

jest.mock('./tableHeading', () => ({
  ...jest.requireActual('./tableHeading'),
  useStyles: jest.fn().mockReturnValue({ empty: '' }),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => jest.fn().mockReturnValue({ chip: '' }),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => jest.fn().mockReturnValue({ chip: '' }),
}));

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockReturnValue({ loading: true }),
}));

describe('AzureContainerRegistry', () => {
  beforeEach(() => {
    (useAsync as jest.Mock).mockClear();
  });

  it('should render repository view', () => {
    const mockAsyncData = {
      loading: false,
      value: {
        tags: mockAcrTagsData.tags,
      },
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { queryByTestId } = render(
      <AzureContainerRegistry image="sample/node" />,
    );
    expect(queryByTestId('acr-repository-view')).toBeInTheDocument();
  });

  it('should show loading', () => {
    const mockAsyncData = {
      loading: true,
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { queryByTestId } = render(
      <AzureContainerRegistry image="sample/node" />,
    );
    expect(queryByTestId('acr-repository-view')).not.toBeInTheDocument();
    expect(queryByTestId('acr-repository-loading')).toBeInTheDocument();
  });

  it('should show error', () => {
    const mockAsyncData = {
      loading: false,
      error: 'something went wrong!!',
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { queryByTestId, getByText } = render(
      <AzureContainerRegistry image="sample/node" />,
    );
    getByText(/something went wrong!!/i);
    expect(queryByTestId('acr-repository-view')).not.toBeInTheDocument();
    expect(queryByTestId('acr-repository-loading')).not.toBeInTheDocument();
  });
});
