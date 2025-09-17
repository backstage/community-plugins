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
import { screen, render, fireEvent } from '@testing-library/react';
import AppCommitLink from '../AppCommitLink';
import {
  mockApplication,
  mockEntity,
  mockRevision,
} from '../../../../dev/__data__';
import {
  History,
  RevisionInfo,
} from '@backstage-community/plugin-redhat-argocd-common';

describe('AppCommitLink', () => {
  it('should return null if application is not passed', () => {
    render(
      <AppCommitLink
        application={mockApplication}
        entity={mockEntity}
        revisions={[]}
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
        revisions={[mockRevision as unknown as RevisionInfo]}
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
        revisions={[mockRevision as unknown as RevisionInfo]}
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
        revisions={[mockRevision as unknown as RevisionInfo]}
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
        revisions={[mockRevision as unknown as RevisionInfo]}
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
