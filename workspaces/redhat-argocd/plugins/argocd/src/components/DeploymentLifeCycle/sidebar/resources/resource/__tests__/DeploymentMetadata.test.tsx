import { render, screen } from '@testing-library/react';
import DeploymentMetadata from '../DeploymentMetadata';
import {
  Application,
  Resource,
  Source,
} from '../../../../../../types/application';
import { useDrawerContext } from '../../../../DrawerContext';
import React from 'react';
import { mockApplication, mockEntity } from '../../../../../../../dev/__data__';
import { useEntity } from '@backstage/plugin-catalog-react';

const resource: Resource = {
  group: 'apps',
  version: 'v1',
  kind: 'Deployment',
  namespace: 'openshift-gitops',
  name: 'quarkus-app',
  status: 'Synced',
  health: {
    status: 'Degraded',
  },
};

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('../../../../DrawerContext', () => ({
  ...jest.requireActual('../../../../DrawerContext'),
  useDrawerContext: jest.fn(),
}));

describe('DeploymentMetadata', () => {
  it('should render Deployment Metadata', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisionsMap: {
        '90f9758b7033a4bbb7c33a35ee474d61091644bc': {
          author: 'test user',
          message: 'commit message',
          date: new Date(),
        },
      },
      appHistory: mockApplication.status.history,
      latestRevision: mockApplication.status.history?.[1],
    });

    render(<DeploymentMetadata resource={resource} />);

    expect(screen.getByText('Deployment history')).toBeInTheDocument();
    expect(screen.getByTestId('90f97-commit-link')).toBeInTheDocument();
  });

  it('should not render application history', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisionsMap: {},
      appHistory: [],
      latestRevision: mockApplication.status.history?.[1],
    });

    render(<DeploymentMetadata resource={resource} />);

    expect(screen.queryByText('Deployment history')).not.toBeInTheDocument();
  });
  it('should render image link', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: undefined as unknown as Source,
      },
    };

    (useEntity as jest.Mock).mockReturnValue({ entity: null });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: remoteApplication,
      revisionsMap: {},
      appHistory: remoteApplication.status.history,
      latestRevision: remoteApplication.status.history?.[1],
    });

    render(<DeploymentMetadata resource={resource} />);

    expect(screen.queryByText('quarkus-app:latest')).toBeInTheDocument();
  });

  it('should not render commit for helm based application', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: {
          ...mockApplication.spec.source,
          chart: 'bitnami',
        },
      },
    };

    (useEntity as jest.Mock).mockReturnValue({ entity: null });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: remoteApplication,
      revisionsMap: {},
      appHistory: remoteApplication.status.history,
      latestRevision: remoteApplication.status.history?.[1],
    });

    render(<DeploymentMetadata resource={resource} />);

    expect(screen.queryByText('commit message')).not.toBeInTheDocument();
  });
});
