/*
 * Copyright 2020 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderHook, waitFor } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { WebsiteListResponse } from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from '../api';
import * as data from '../__fixtures__/website-list-response.json';
import { useWebsiteForEntity } from './useWebsiteForEntity';

import { errorApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';

const websiteListResponse = data as WebsiteListResponse;
const website = websiteListResponse.items[0];

const mockErrorApi: jest.Mocked<typeof errorApiRef.T> = {
  post: jest.fn(),
  error$: jest.fn(),
};

const mockLighthouseApi: jest.Mocked<Partial<typeof lighthouseApiRef.T>> = {
  getWebsiteByUrl: jest.fn(),
};

describe('useWebsiteForEntity', () => {
  const entity: Entity = {
    apiVersion: 'v1',
    kind: 'Component',
    metadata: {
      name: 'software',
      annotations: {
        'lighthouse.com/website-url': website.url,
      },
    },
    spec: {
      owner: 'guest',
      type: 'Website',
      lifecycle: 'development',
    },
  };

  const wrapper = ({ children }: PropsWithChildren<{}>) => {
    return (
      <TestApiProvider
        apis={[
          [errorApiRef, mockErrorApi],
          [lighthouseApiRef, mockLighthouseApi],
        ]}
      >
        <EntityProvider entity={entity}>{children}</EntityProvider>
      </TestApiProvider>
    );
  };

  const subject = () =>
    renderHook(useWebsiteForEntity, {
      wrapper,
    });

  beforeEach(() => {
    (mockLighthouseApi.getWebsiteByUrl as jest.Mock).mockResolvedValue(website);
  });

  it('returns the lighthouse information for the website url in annotations', async () => {
    const { result } = subject();
    await waitFor(() => {
      expect(result.current?.value).toBe(website);
    });
  });

  describe('where there is an error', () => {
    const error = new Error('useWebsiteForEntity unit test');

    beforeEach(() => {
      (mockLighthouseApi.getWebsiteByUrl as jest.Mock).mockRejectedValueOnce(
        error,
      );
    });

    it('posts the error to the error api and returns the error to the caller', async () => {
      const { result } = subject();
      await waitFor(() => {
        expect(result.current?.error).toBe(error);
        expect(mockErrorApi.post).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('where there is an error regarding "no audited websites for url"', () => {
    const error = new Error('no audited website found for url unit-test-url');

    beforeEach(() => {
      (mockLighthouseApi.getWebsiteByUrl as jest.Mock).mockRejectedValueOnce(
        error,
      );
    });

    it('does not post the error to the error api and returns the error to the caller', async () => {
      const { result } = subject();
      await waitFor(() => {
        expect(result.current?.error).toBe(error);
        expect(mockErrorApi.post).not.toHaveBeenCalledWith(error);
      });
    });
  });
});
