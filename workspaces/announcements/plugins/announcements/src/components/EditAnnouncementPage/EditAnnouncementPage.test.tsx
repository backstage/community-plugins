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

import { Route } from 'react-router-dom';

import { FlatRoutes } from '@backstage/core-app-api';
import { alertApiRef } from '@backstage/core-plugin-api';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import {
  TestApiProvider,
  mockApis,
  renderInTestApp,
} from '@backstage/test-utils';
import {
  AnnouncementsApi,
  announcementsApiRef,
  CreateAnnouncementRequest,
} from '@backstage-community/plugin-announcements-react';
import * as AnnouncementsReact from '@backstage-community/plugin-announcements-react';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as AnnouncementForm from '../AnnouncementForm';
import { rootRouteRef } from '../../routes';

import { EditAnnouncementPage } from './EditAnnouncementPage';

jest.mock('../AnnouncementForm');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  ...jest.requireActual('@backstage-community/plugin-announcements-react'),
  useAnnouncementsTranslation: () => ({ t: (key: string) => key }),
  useCategories: jest.fn().mockReturnValue({ categories: [] }),
}));

const announcementsApiMock: jest.Mocked<
  Pick<
    AnnouncementsApi,
    'announcementByID' | 'createCategory' | 'updateAnnouncement'
  >
> = {
  announcementByID: jest.fn(),
  createCategory: jest.fn(),
  updateAnnouncement: jest.fn(),
};

const alertApiMock = { post: jest.fn() };

const renderEditAnnouncementPage = async () => {
  return renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, announcementsApiMock],
        [alertApiRef, alertApiMock],
        [permissionApiRef, mockApis.permission()],
      ]}
    >
      <FlatRoutes>
        <Route
          path="/announcements/edit/:id"
          element={
            <EditAnnouncementPage themeId="home" title="Announcements" />
          }
        />
      </FlatRoutes>
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
        '/catalog/:namespace/:kind/:name': entityRouteRef,
      },
      routeEntries: ['/announcements/edit/1'],
    },
  );
};

describe('EditAnnouncementPage', () => {
  const announcement = {
    id: '1',
    publisher: 'default:user/user',
    title: 'Announcement title',
    excerpt: 'Announcement excerpt',
    body: 'Announcement body',
    created_at: '2025-01-10T00:00:00.000Z',
    updated_at: '2025-01-10T00:00:00.000Z',
    active: true,
    start_at: '2025-01-10T00:00:00.000Z',
    until_date: '2025-02-10T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    mockNavigate.mockClear();
  });

  it('renders loading state', async () => {
    jest.useFakeTimers();

    announcementsApiMock.announcementByID.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(announcement);
        }, 1000);
      });
    });

    await renderEditAnnouncementPage();

    expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');

    await screen.findByRole('progressbar');

    jest.runAllTimers();

    await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

    expect(
      screen.getByRole('heading', {
        name: 'editAnnouncementPage.edit "Announcement title" – Announcements',
      }),
    ).toBeVisible();
  });

  it('renders error state', async () => {
    announcementsApiMock.announcementByID.mockRejectedValue(
      new Error('Failed'),
    );

    await renderEditAnnouncementPage();

    const alert = screen.getByRole('alert');

    expect(alert).toBeVisible();

    expect(within(alert).getByText(/failed/i)).toBeVisible();
  });

  it('renders not found message', async () => {
    announcementsApiMock.announcementByID.mockResolvedValueOnce(
      undefined as any,
    );

    await renderEditAnnouncementPage();

    const alert = screen.getByRole('alert');

    expect(alert).toBeVisible();

    expect(
      within(alert).getByText('editAnnouncementPage.notFoundMessage'),
    ).toBeVisible();
  });

  it('renders form when announcement is loaded', async () => {
    jest
      .spyOn(AnnouncementForm, 'AnnouncementForm')
      .mockImplementationOnce(() => <div data-testid="announcement-form" />);
    announcementsApiMock.announcementByID.mockResolvedValueOnce(announcement);

    await renderEditAnnouncementPage();

    expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');

    expect(screen.getByTestId('announcement-form')).toBeVisible();
  });

  describe('when updating announcement', () => {
    describe('with no category', () => {
      it('submits update successfully without creating a category', async () => {
        jest
          .spyOn(AnnouncementForm, 'AnnouncementForm')
          .mockImplementationOnce(
            ({
              onSubmit,
            }: {
              onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
            }) => (
              <div data-testid="announcement-form">
                (
                <button
                  onClick={() =>
                    onSubmit({
                      ...announcement,
                      title: 'Updated title',
                    })
                  }
                >
                  Submit
                </button>
                )
              </div>
            ),
          );

        announcementsApiMock.announcementByID.mockResolvedValue(announcement);

        await renderEditAnnouncementPage();

        expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');

        expect(screen.getByTestId('announcement-form')).toBeVisible();

        const submitButton = screen.getByRole('button', { name: /submit/i });

        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(announcementsApiMock.updateAnnouncement).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              title: 'Updated title',
            }),
          );
        });

        expect(announcementsApiMock.createCategory).not.toHaveBeenCalled();

        expect(alertApiMock.post).toHaveBeenCalledWith({
          message: 'editAnnouncementPage.updatedMessage',
          severity: 'success',
          display: 'transient',
        });

        expect(mockNavigate).toHaveBeenCalledWith('/announcements');
      });
    });

    describe('with existing category', () => {
      it('submits update successfully without creating a category', async () => {
        jest.spyOn(AnnouncementsReact, 'useCategories').mockReturnValue({
          categories: [{ slug: 'existing-cat', title: 'Existing Category' }],
          loading: false,
          error: undefined,
          retry: jest.fn(),
        });

        jest
          .spyOn(AnnouncementForm, 'AnnouncementForm')
          .mockImplementationOnce(
            ({
              onSubmit,
            }: {
              onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
            }) => (
              <div data-testid="announcement-form">
                (
                <button
                  onClick={() =>
                    onSubmit({
                      ...announcement,
                      category: 'existing-cat',
                      title: 'Updated title',
                    })
                  }
                >
                  Submit
                </button>
                )
              </div>
            ),
          );

        announcementsApiMock.announcementByID.mockResolvedValue(announcement);

        await renderEditAnnouncementPage();

        expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');

        expect(screen.getByTestId('announcement-form')).toBeVisible();

        const submitButton = screen.getByRole('button', { name: /submit/i });

        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(announcementsApiMock.updateAnnouncement).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              title: 'Updated title',
            }),
          );
        });

        expect(announcementsApiMock.createCategory).not.toHaveBeenCalled();

        expect(alertApiMock.post).toHaveBeenCalledWith({
          message: 'editAnnouncementPage.updatedMessage',
          severity: 'success',
          display: 'transient',
        });

        expect(mockNavigate).toHaveBeenCalledWith('/announcements');
      });
    });

    describe('with new category', () => {
      it('creates category and submits update successfully', async () => {
        jest
          .spyOn(AnnouncementForm, 'AnnouncementForm')
          .mockImplementationOnce(
            ({
              onSubmit,
            }: {
              onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
            }) => (
              <div data-testid="announcement-form">
                (
                <button
                  onClick={() =>
                    onSubmit({
                      ...announcement,
                      category: 'updated-category',
                      title: 'Updated title',
                    })
                  }
                >
                  Submit
                </button>
                )
              </div>
            ),
          );

        announcementsApiMock.announcementByID.mockResolvedValue(announcement);

        await renderEditAnnouncementPage();

        expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');

        expect(screen.getByTestId('announcement-form')).toBeVisible();

        const submitButton = screen.getByRole('button', { name: /submit/i });

        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(announcementsApiMock.updateAnnouncement).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              title: 'Updated title',
            }),
          );
        });

        expect(announcementsApiMock.createCategory).toHaveBeenCalledWith({
          title: 'updated-category',
        });

        expect(alertApiMock.post).toHaveBeenCalledWith({
          message:
            'editAnnouncementPageupdatedMessage editAnnouncementPage.updatedMessageWithNewCategory updated-category.',
          severity: 'success',
          display: 'transient',
        });

        expect(mockNavigate).toHaveBeenCalledWith('/announcements');
      });
    });

    describe('fails', () => {
      it('posts error', async () => {
        jest
          .spyOn(AnnouncementForm, 'AnnouncementForm')
          .mockImplementationOnce(
            ({
              onSubmit,
            }: {
              onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
            }) => (
              <div data-testid="announcement-form">
                (
                <button
                  onClick={() =>
                    onSubmit({
                      ...announcement,
                      title: 'Updated title',
                    })
                  }
                >
                  Submit
                </button>
                )
              </div>
            ),
          );

        announcementsApiMock.announcementByID.mockResolvedValue(announcement);

        announcementsApiMock.updateAnnouncement.mockRejectedValue(
          new Error('Update failed'),
        );

        await renderEditAnnouncementPage();

        expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');

        expect(screen.getByTestId('announcement-form')).toBeVisible();

        const submitButton = screen.getByRole('button', { name: /submit/i });

        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(alertApiMock.post).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Update failed',
              severity: 'error',
            }),
          );
        });

        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
