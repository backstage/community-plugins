import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VulnerabilitiesComponent } from './VulnerabilitiesComponent';
import { QueryACSData } from '../../common/QueryACSData';

jest.mock('../../common/QueryACSData', () => ({
  QueryACSData: jest.fn(),
}));

describe('VulnerabilitiesComponent', () => {
  test('displays loading state initially', () => {
    (QueryACSData as jest.Mock).mockReturnValue({
      result: null,
      loaded: false,
      error: null,
    });

    render(<VulnerabilitiesComponent deploymentName={"Test"} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when data fetch fails', () => {
    (QueryACSData as jest.Mock).mockReturnValue({
      result: null,
      loaded: true,
      error: new Error('Test error'),
    });

    render(<VulnerabilitiesComponent deploymentName={"Test"}/>);

    expect(
      screen.getByText(/error retrieving data from ACS./i),
    ).toBeInTheDocument();
  });
});
