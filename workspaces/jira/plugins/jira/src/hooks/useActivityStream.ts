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
import { useCallback, useEffect } from 'react';
import convert from 'xml-js';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import {
  ActivityStreamElement,
  ActivityStreamEntry,
  ActivityStreamKeys,
} from '../types';
import { jiraApiRef } from '../api';
import { handleError } from '../utils';

const getPropertyValue = (
  entry: ActivityStreamEntry,
  property: ActivityStreamKeys,
): string => entry[property]?._text;
const decodeHtml = (html: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

/**
 * @public
 *
 * Custom hook to fetch and manage the activity stream from Jira.
 *
 * @param {number} size - The number of activity stream entries to fetch.
 * @param {string[]} ticketIds - An array of ticket IDs to filter the activity stream.
 * @param {string} [projectKey] - Optional project key to filter the activity stream.
 * @param {boolean} [loading] - Optional loading state to control when to fetch the activity stream.
 *
 * @returns {object} An object containing:
 * - `activitiesLoading` (boolean): Indicates if the activities are currently being loaded.
 * - `activities` (Array<ActivityStreamElement> | undefined): The fetched activity stream entries.
 * - `activitiesError` (Error | undefined): Any error encountered while fetching the activity stream.
 */
export const useActivityStream = (
  size: number,
  ticketIds: string[],
  projectKey?: string,
  loading?: boolean,
) => {
  const api = useApi(jiraApiRef);

  const getActivityStream = useCallback(async () => {
    try {
      const response = await api.getActivityStream(size, ticketIds, projectKey);
      const parsedData = JSON.parse(
        convert.xml2json(response, { compact: true, spaces: 2 }),
      );
      const entries = Array.isArray(parsedData.feed.entry)
        ? parsedData.feed.entry
        : [parsedData.feed.entry];
      const mappedData = entries.map(
        (entry: ActivityStreamEntry): ActivityStreamElement => {
          const time = getPropertyValue(entry, 'updated');
          return {
            time: {
              value: new Date(time).toLocaleTimeString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            },
            title: decodeHtml(getPropertyValue(entry, 'title')),
          };
        },
      );
      return mappedData as Array<ActivityStreamElement>;
    } catch (err: any) {
      return handleError(err);
    }
  }, [api, size, projectKey, ticketIds]);

  const [state, fetchActivityStream] = useAsyncFn(() => {
    if (!loading) {
      return getActivityStream();
    }
    return Promise.resolve([]);
  }, [size, projectKey, ticketIds, loading]);

  useEffect(() => {
    fetchActivityStream();
  }, [size, fetchActivityStream]);

  return {
    activitiesLoading: state.loading,
    activities: state.value,
    activitiesError: state.error,
  };
};
