import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import AppCommitLink from '../AppCommitLink';
import {
  mockApplication,
  mockEntity,
  mockRevision,
} from '../../../../dev/__data__';
import { History, RevisionInfo } from '../../../types/application';

describe('AppCommitLink', () => {
  it('should return null if application is not passed', () => {
    render(
      <AppCommitLink
        application={mockApplication}
        entity={mockEntity}
        revisionsMap={{}}
        latestRevision={mockApplication.status.history?.[1] as History}
      />,
    );

    expect(screen.getByTestId('90f97-commit-link')).toBeInTheDocument();
  });

  test('should render the commit link', () => {
    global.open = jest.fn();

    render(
      <AppCommitLink
        application={mockApplication}
        entity={mockEntity}
        revisionsMap={{
          '90f9758b7033a4bbb7c33a35ee474d61091644bc':
            mockRevision as unknown as RevisionInfo,
        }}
        latestRevision={mockApplication.status.history?.[1] as History}
      />,
    );

    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalled();
    expect(global.open).toHaveBeenCalledWith(
      'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops',
      '_blank',
    );
  });

  test('should not render the commit link', () => {
    global.open = jest.fn();

    render(
      <AppCommitLink
        application={{
          ...mockApplication,
          spec: {
            ...mockApplication.spec,
            source: {
              ...mockApplication.spec.source,
              repoURL: null as unknown as string,
            },
          },
        }}
        entity={{ ...mockEntity, metadata: { name: 'entity' } }}
        revisionsMap={{
          '90f9758b7033a4bbb7c33a35ee474d61091644bc':
            mockRevision as unknown as RevisionInfo,
        }}
        latestRevision={mockApplication.status.history?.[1] as History}
      />,
    );

    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).not.toHaveBeenCalled();
  });

  test('should render the commit message', () => {
    render(
      <AppCommitLink
        application={mockApplication}
        entity={mockEntity}
        revisionsMap={{
          '90f9758b7033a4bbb7c33a35ee474d61091644bc':
            mockRevision as unknown as RevisionInfo,
        }}
        latestRevision={mockApplication.status.history?.[1] as History}
      />,
    );

    expect(screen.getByTestId('90f97-commit-message')).toBeInTheDocument();
  });

  test('should render the commit message with author information', () => {
    render(
      <AppCommitLink
        application={mockApplication}
        entity={mockEntity}
        revisionsMap={{
          '90f9758b7033a4bbb7c33a35ee474d61091644bc':
            mockRevision as unknown as RevisionInfo,
        }}
        latestRevision={mockApplication.status.history?.[1] as History}
        showAuthor
      />,
    );

    expect(screen.getByTestId('90f97-commit-message')).toBeInTheDocument();

    expect(
      screen.getByText('First release by author-name'),
    ).toBeInTheDocument();
  });
});
