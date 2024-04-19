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
import { AddShortcut } from './AddShortcut';
import { DefaultShortcutsApi, shortcutsApiRef } from './api';
import {
  MockAnalyticsApi,
  MockStorageApi,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { AlertDisplay } from '@backstage/core-components';
import { analyticsApiRef } from '@backstage/core-plugin-api';

describe('AddShortcut', () => {
  const api = new DefaultShortcutsApi(MockStorageApi.create());

  const props = {
    onClose: jest.fn(),
    anchorEl: document.createElement('div'),
    api,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.title = 'some document title';
  });

  it('displays the title', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
        ]}
      >
        <AddShortcut {...props} />
      </TestApiProvider>,
    );

    expect(screen.getByText('Add Shortcut')).toBeInTheDocument();
  });

  it('closes the popup', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
        ]}
      >
        <AddShortcut {...props} />
      </TestApiProvider>,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('saves the input', async () => {
    const spy = jest.spyOn(api, 'add');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
        ]}
      >
        <AddShortcut {...props} />
      </TestApiProvider>,
    );

    const urlInput = screen.getByPlaceholderText('Enter a URL');
    const titleInput = screen.getByPlaceholderText('Enter a display name');
    fireEvent.change(urlInput, { target: { value: '/some-url' } });
    fireEvent.change(titleInput, { target: { value: 'some title' } });

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        title: 'some title',
        url: '/some-url',
      });
    });
  });

  it('should capture analytics event', async () => {
    const analyticsSpy = new MockAnalyticsApi();
    const spy = jest.spyOn(api, 'add');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [analyticsApiRef, analyticsSpy],
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
        ]}
      >
        <AddShortcut {...props} />
      </TestApiProvider>,
    );

    const urlInput = screen.getByPlaceholderText('Enter a URL');
    const titleInput = screen.getByPlaceholderText('Enter a display name');
    fireEvent.change(urlInput, { target: { value: '/some-url' } });
    fireEvent.change(titleInput, { target: { value: 'some title' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        title: 'some title',
        url: '/some-url',
      });
    });

    expect(analyticsSpy.getEvents()[0]).toMatchObject({
      action: 'click',
      subject: `Clicked 'Save' in AddShortcut`,
    });
  });

  it('pastes the values', async () => {
    const spy = jest.spyOn(api, 'add');

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
        ]}
      >
        <AddShortcut {...props} />,
      </TestApiProvider>,
      {
        routeEntries: ['/some-initial-url'],
      },
    );

    fireEvent.click(screen.getByText('Use current page'));
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        title: 'some document title',
        url: '/some-initial-url',
      });
    });
  });

  it('displays errors', async () => {
    jest.spyOn(api, 'add').mockRejectedValueOnce(new Error('some add error'));

    await renderInTestApp(
      <>
        <TestApiProvider
          apis={[
            [shortcutsApiRef, new DefaultShortcutsApi(MockStorageApi.create())],
          ]}
        >
          <AlertDisplay />
          <AddShortcut {...props} />
        </TestApiProvider>
      </>,
    );

    fireEvent.click(screen.getByText('Use current page'));
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(
        screen.getByText('Could not add shortcut: some add error'),
      ).toBeInTheDocument();
    });
  });
});
