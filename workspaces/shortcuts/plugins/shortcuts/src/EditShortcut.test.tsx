/*
 * Copyright 2021 The Backstage Authors
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

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { EditShortcut } from './EditShortcut';
import { Shortcut } from './types';
import { DefaultShortcutsApi, shortcutsApiRef } from './api';
import {
  mockApis,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { analyticsApiRef } from '@backstage/core-plugin-api';
import { coreApis } from '@backstage/frontend-plugin-api';

describe('EditShortcut', () => {
  const shortcut: Shortcut = {
    id: 'id',
    url: '/some-url',
    title: 'some title',
  };
  const api = new DefaultShortcutsApi(mockApis.storage());
  const toastApi = { post: jest.fn() };

  const props = {
    onClose: jest.fn(),
    anchorEl: document.createElement('div'),
    shortcut,
    api,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the title', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    expect(screen.getByText('Edit Shortcut')).toBeInTheDocument();
  });

  it('closes the popup', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('updates the shortcut', async () => {
    const spy = jest.spyOn(api, 'update');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    const urlInput = screen.getByPlaceholderText('Enter a URL');
    const titleInput = screen.getByPlaceholderText('Enter a display name');
    fireEvent.change(urlInput, { target: { value: '/some-new-url' } });
    fireEvent.change(titleInput, { target: { value: 'some new title' } });

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        id: 'id',
        title: 'some new title',
        url: '/some-new-url',
      });
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should capture analytics event', async () => {
    const analyticsSpy = mockApis.analytics.mock();
    const spy = jest.spyOn(api, 'update');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [analyticsApiRef, analyticsSpy],
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    const urlInput = screen.getByPlaceholderText('Enter a URL');
    const titleInput = screen.getByPlaceholderText('Enter a display name');
    fireEvent.change(urlInput, { target: { value: '/some-new-url' } });
    fireEvent.change(titleInput, { target: { value: 'some new title' } });

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        id: 'id',
        title: 'some new title',
        url: '/some-new-url',
      });
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    expect(analyticsSpy.captureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'click',
        subject: `Clicked 'Save' in Edit Shortcut`,
      }),
    );
  });

  it('removes the shortcut', async () => {
    const spy = jest.spyOn(api, 'remove');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    fireEvent.click(screen.getByText('Remove'));
    expect(spy).toHaveBeenCalledWith('id');
  });

  it('should capture remove analytics event', async () => {
    const analyticsSpy = mockApis.analytics.mock();
    const spy = jest.spyOn(api, 'remove');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [analyticsApiRef, analyticsSpy],
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    fireEvent.click(screen.getByText('Remove'));
    expect(spy).toHaveBeenCalledWith('id');

    expect(analyticsSpy.captureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'click',
        subject: `Clicked 'Remove' in Edit Shortcut`,
      }),
    );
  });

  it('displays errors', async () => {
    jest
      .spyOn(api, 'update')
      .mockRejectedValueOnce(new Error('some update error'));

    jest
      .spyOn(api, 'remove')
      .mockRejectedValueOnce(new Error('some remove error'));

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [coreApis.toast, toastApi],
          [shortcutsApiRef, new DefaultShortcutsApi(mockApis.storage())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(toastApi.post).toHaveBeenCalledWith({
        title: 'Could not update shortcut: some update error',
        status: 'danger',
      });
    });

    fireEvent.click(screen.getByText('Remove'));
    await waitFor(() => {
      expect(toastApi.post).toHaveBeenCalledWith({
        title: 'Could not delete shortcut: some remove error',
        status: 'danger',
      });
    });
  });
});
