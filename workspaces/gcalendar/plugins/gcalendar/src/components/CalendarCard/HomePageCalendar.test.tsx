/*
 * Copyright 2022 The Backstage Authors
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

import { within } from '@testing-library/react';
import { googleAuthApiRef, storageApiRef } from '@backstage/core-plugin-api';
import {
  mockApis,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { HomePageCalendar } from './HomePageCalendar';
import { gcalendarApiRef } from '../../api';
import { gcalendarPlugin } from '../../plugin';

// The BUI Select renders a visually hidden native <select> (wrapped in an
// aria-hidden container) for form/autofill support, which duplicates the
// visible trigger text. Filter those out when asserting on selected values.
const getVisibleCalendarSelectText = (container: HTMLElement, text: string) =>
  within(container)
    .queryAllByText(text)
    .find(el => !el.closest('[aria-hidden="true"]'));

describe('<HomePageCalendar />', () => {
  const primaryCalendar = {
    id: 'test-1@test.com',
    summary: 'test-1@test.com',
    primary: true,
  };
  const nonPrimaryCalendar = {
    id: 'test-2@test.com',
    summary: 'test-2@test.com',
    primary: false,
  };
  const calendarData = {
    items: [primaryCalendar, nonPrimaryCalendar],
  };
  const eventData = {
    items: [
      {
        id: '1',
        summary: 'Test event',
      },
      {
        id: '2',
        summary: 'Test event',
      },
    ],
  };

  const getMockedApi = (calendarMock = {}, eventMock = {}) => ({
    getCalendars: jest.fn().mockResolvedValue(calendarMock),
    getEvents: jest.fn().mockResolvedValue(eventMock),
  });

  const getAuthMockApi = (token = 'token') => ({
    getAccessToken: jest.fn().mockResolvedValue(token),
  });

  const mockStorage = mockApis.storage();

  it('should render "Sign in" button if user not signed in', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider
        apis={[
          [gcalendarApiRef, getMockedApi()],
          [googleAuthApiRef, getAuthMockApi('')],
        ]}
      >
        <HomePageCalendar />
      </TestApiProvider>,
    );

    expect(await rendered.findByText('Sign in')).toBeInTheDocument();
  });

  it('should render empty card', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider
        apis={[
          [gcalendarApiRef, getMockedApi()],
          [googleAuthApiRef, getAuthMockApi()],
        ]}
      >
        <HomePageCalendar />
      </TestApiProvider>,
    );

    expect(await rendered.findByText('No events')).toBeInTheDocument();
    expect(await rendered.findByText('Go to Calendar')).toBeInTheDocument();
  });

  it('should select primary calendar by default', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider
        apis={[
          [gcalendarApiRef, getMockedApi(calendarData, eventData)],
          [googleAuthApiRef, getAuthMockApi()],
        ]}
      >
        <HomePageCalendar />
      </TestApiProvider>,
    );

    const calendarsSelect = await rendered.findByTestId('calendars-select');
    expect(
      getVisibleCalendarSelectText(calendarsSelect, primaryCalendar.summary),
    ).toBeInTheDocument();
    expect(
      getVisibleCalendarSelectText(calendarsSelect, nonPrimaryCalendar.summary),
    ).toBeUndefined();
  });

  it('should render calendar events', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider
        apis={[
          [gcalendarApiRef, getMockedApi(calendarData, eventData)],
          [googleAuthApiRef, getAuthMockApi()],
        ]}
      >
        <HomePageCalendar />
      </TestApiProvider>,
    );

    expect(await rendered.findAllByText('Test event')).toHaveLength(2);
    expect(rendered.queryByText('No events')).not.toBeInTheDocument();
  });

  it('should select stored calendar', async () => {
    await mockStorage
      .forBucket(gcalendarPlugin.getId())
      .set('google_calendars_selected', [nonPrimaryCalendar.id]);

    const rendered = await renderInTestApp(
      <TestApiProvider
        apis={[
          [gcalendarApiRef, getMockedApi(calendarData, eventData)],
          [googleAuthApiRef, getAuthMockApi()],
          [storageApiRef, mockStorage],
        ]}
      >
        <HomePageCalendar />
      </TestApiProvider>,
    );

    const calendarsSelect = await rendered.findByTestId('calendars-select');
    expect(
      getVisibleCalendarSelectText(calendarsSelect, nonPrimaryCalendar.summary),
    ).toBeInTheDocument();
    expect(
      getVisibleCalendarSelectText(calendarsSelect, primaryCalendar.summary),
    ).toBeUndefined();
  });
});
