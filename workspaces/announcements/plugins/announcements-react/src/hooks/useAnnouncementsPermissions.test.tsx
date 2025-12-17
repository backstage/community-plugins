/*
 * Copyright 2025 The Backstage Authors
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
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { useAnnouncementsPermissions } from './useAnnouncementsPermissions';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';

// Mock usePermission hook
const mockUsePermission = jest.fn();
jest.mock('@backstage/plugin-permission-react', () => ({
  ...jest.requireActual('@backstage/plugin-permission-react'),
  usePermission: (args: { permission: any }) => mockUsePermission(args),
}));

/**
 * A test component that uses the useAnnouncementsPermissions hook.
 */
const TestComponent = () => {
  const permissions = useAnnouncementsPermissions();

  return (
    <div>
      <div data-testid="create-allowed">
        {permissions.create.allowed ? 'true' : 'false'}
      </div>
      <div data-testid="create-loading">
        {permissions.create.loading ? 'true' : 'false'}
      </div>
      <div data-testid="delete-allowed">
        {permissions.delete.allowed ? 'true' : 'false'}
      </div>
      <div data-testid="delete-loading">
        {permissions.delete.loading ? 'true' : 'false'}
      </div>
      <div data-testid="update-allowed">
        {permissions.update.allowed ? 'true' : 'false'}
      </div>
      <div data-testid="update-loading">
        {permissions.update.loading ? 'true' : 'false'}
      </div>
      <div data-testid="is-loading">
        {permissions.isLoading ? 'true' : 'false'}
      </div>
    </div>
  );
};

describe('useAnnouncementsPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all permissions as allowed when user has all permissions', async () => {
    mockUsePermission.mockImplementation(({ permission }) => {
      if (
        permission ===
        announcementEntityPermissions.announcementCreatePermission
      ) {
        return { loading: false, allowed: true };
      }
      if (
        permission ===
        announcementEntityPermissions.announcementDeletePermission
      ) {
        return { loading: false, allowed: true };
      }
      if (
        permission ===
        announcementEntityPermissions.announcementUpdatePermission
      ) {
        return { loading: false, allowed: true };
      }
      return { loading: false, allowed: false };
    });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-allowed')).toHaveTextContent('true');
    expect(screen.getByTestId('create-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('delete-allowed')).toHaveTextContent('true');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('update-allowed')).toHaveTextContent('true');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('should return all permissions as denied when user has no permissions', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-allowed')).toHaveTextContent('false');
    expect(screen.getByTestId('create-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('delete-allowed')).toHaveTextContent('false');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('update-allowed')).toHaveTextContent('false');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('should return mixed permissions correctly', async () => {
    mockUsePermission.mockImplementation(({ permission }) => {
      if (
        permission ===
        announcementEntityPermissions.announcementCreatePermission
      ) {
        return { loading: false, allowed: true };
      }
      if (
        permission ===
        announcementEntityPermissions.announcementDeletePermission
      ) {
        return { loading: false, allowed: false };
      }
      if (
        permission ===
        announcementEntityPermissions.announcementUpdatePermission
      ) {
        return { loading: false, allowed: true };
      }
      return { loading: false, allowed: false };
    });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-allowed')).toHaveTextContent('true');
    expect(screen.getByTestId('delete-allowed')).toHaveTextContent('false');
    expect(screen.getByTestId('update-allowed')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('should return isLoading as true when create permission is loading', async () => {
    mockUsePermission.mockImplementation(({ permission }) => {
      if (
        permission ===
        announcementEntityPermissions.announcementCreatePermission
      ) {
        return { loading: true, allowed: false };
      }
      return { loading: false, allowed: false };
    });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('should return isLoading as true when delete permission is loading', async () => {
    mockUsePermission.mockImplementation(({ permission }) => {
      if (
        permission ===
        announcementEntityPermissions.announcementDeletePermission
      ) {
        return { loading: true, allowed: false };
      }
      return { loading: false, allowed: false };
    });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('should return isLoading as true when update permission is loading', async () => {
    mockUsePermission.mockImplementation(({ permission }) => {
      if (
        permission ===
        announcementEntityPermissions.announcementUpdatePermission
      ) {
        return { loading: true, allowed: false };
      }
      return { loading: false, allowed: false };
    });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('should return isLoading as true when multiple permissions are loading', async () => {
    mockUsePermission.mockImplementation(({ permission }) => {
      if (
        permission ===
        announcementEntityPermissions.announcementCreatePermission
      ) {
        return { loading: true, allowed: false };
      }
      if (
        permission ===
        announcementEntityPermissions.announcementDeletePermission
      ) {
        return { loading: true, allowed: false };
      }
      return { loading: false, allowed: false };
    });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('should return isLoading as true when all permissions are loading', async () => {
    mockUsePermission.mockReturnValue({ loading: true, allowed: false });

    await renderInTestApp(<TestComponent />);

    expect(screen.getByTestId('create-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('delete-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('update-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('should call usePermission with correct permissions', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(<TestComponent />);

    expect(mockUsePermission).toHaveBeenCalledTimes(3);
    expect(mockUsePermission).toHaveBeenCalledWith({
      permission: announcementEntityPermissions.announcementCreatePermission,
    });
    expect(mockUsePermission).toHaveBeenCalledWith({
      permission: announcementEntityPermissions.announcementDeletePermission,
    });
    expect(mockUsePermission).toHaveBeenCalledWith({
      permission: announcementEntityPermissions.announcementUpdatePermission,
    });
  });
});
