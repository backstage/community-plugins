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

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { EditShortcut } from './EditShortcut';
import { Shortcut } from './types';
import { DefaultShortcutsApi, shortcutsApiRef } from './api';
import {
  MockAnalyticsApi,
  MockStorageApi,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { AlertDisplay } from '@backstage/core-components';
import { analyticsApiRef } from '@backstage/core-plugin-api';

describe('EditShortcut', () => {
  const shortcut: Shortcut = {
    id: 'id',
    url: '/some-url',
    title: 'some title',
  };
  const api = new DefaultShortcutsApi(MockStorageApi.create());

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
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
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
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
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
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
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
    const analyticsSpy = new MockAnalyticsApi();
    const spy = jest.spyOn(api, 'update');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [analyticsApiRef, analyticsSpy],
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
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

    expect(analyticsSpy.getEvents()[0]).toMatchObject({
      action: 'click',
      subject: `Clicked 'Save' in Edit Shortcut`,
    });
  });

  it('removes the shortcut', async () => {
    const spy = jest.spyOn(api, 'remove');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
        ]}
      >
        <EditShortcut {...props} />
      </TestApiProvider>,
    );

    fireEvent.click(screen.getByText('Remove'));
    expect(spy).toHaveBeenCalledWith('id');
  });

  it('displays errors', async () => {
    jest
      .spyOn(api, 'update')
      .mockRejectedValueOnce(new Error('some update error'));

    jest
      .spyOn(api, 'remove')
      .mockRejectedValueOnce(new Error('some remove error'));

    await renderInTestApp(
      <>
        <TestApiProvider
          apis={[
            [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
          ]}
        >
          <AlertDisplay />
          <EditShortcut {...props} />
        </TestApiProvider>
      </>,
    );

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(
        screen.getByText('Could not update shortcut: some update error'),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('error-button-close'));

    fireEvent.click(screen.getByText('Remove'));
    await waitFor(() => {
      expect(
        screen.getByText('Could not delete shortcut: some remove error'),
      ).toBeInTheDocument();
    });
  });
});
