import React from 'react';

import { render, screen } from '@testing-library/react';

import { HealthStatus, SyncStatusCode } from '../../../types/application';
import { AppHealthIcon, SyncIcon } from '../StatusIcons';

describe('StatusIcons', () => {
  describe('Sync Status', () => {
    test('should return application sync icon', () => {
      render(<SyncIcon status="Synced" />);
      expect(screen.getByTestId('synced-icon')).toBeInTheDocument();

      render(<SyncIcon status="OutOfSync" />);
      expect(screen.getByTestId('outofsync-icon')).toBeInTheDocument();

      render(<SyncIcon status="Unknown" />);
      expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();

      render(<SyncIcon status={'invalid' as SyncStatusCode} />);
      expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    });
  });

  describe('Health Status', () => {
    test('should return application health status icon', () => {
      render(<AppHealthIcon status={HealthStatus.Healthy} />);
      expect(screen.getByTestId('healthy-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Suspended} />);
      expect(screen.getByTestId('suspended-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Progressing} />);
      expect(screen.getByTestId('progressing-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Missing} />);
      expect(screen.getByTestId('missing-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Degraded} />);
      expect(screen.getByTestId('degraded-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Unknown} />);
      expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    });
  });
});
