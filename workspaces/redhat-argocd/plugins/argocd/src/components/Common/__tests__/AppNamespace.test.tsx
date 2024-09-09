import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import { Application } from '../../../types/application';
import AppNamespace from '../AppNamespace';

describe('AppNamespace', () => {
  test('should not render if the application is not available', () => {
    render(<AppNamespace app={null as unknown as Application} />);
    expect(
      screen.queryByText(mockApplication.spec.destination.namespace),
    ).not.toBeInTheDocument();
  });

  test('should render the namespace application is available', () => {
    render(<AppNamespace app={mockApplication} />);

    expect(
      screen.queryByText(mockApplication.spec.destination.namespace),
    ).toBeInTheDocument();
  });
});
